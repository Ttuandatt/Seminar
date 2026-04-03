// LocalizationPanel.tsx
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { BCP47Language, PoiLocalization } from '@localization-shared';
import { usePoiLocalizations } from '@localization-shared';
import type { LocalizationPanelProps, LocalizationPanelHandle, LocalizationPanelState } from './LocalizationPanel.types';
import { LocalizationAccordionItem } from './LocalizationPanelAccordion';
import { useSupportedLanguages } from '../../hooks/useSupportedLanguages';
import { localizationAnalytics } from '../../services/localization-analytics';
import {
  isTranslationRequestPending,
  listPendingTranslationRequests,
  markTranslationRequestPending,
} from '../../services/localizationPendingRequests';
import styles from './LocalizationPanel.module.css';

function languageKey(language: BCP47Language) {
  return String(language).toUpperCase();
}

function buildLocalizationMap(items: PoiLocalization[]) {
  return new Map(items.map((item) => [languageKey(item.language), item] as const));
}

const LocalizationPanel = forwardRef<LocalizationPanelHandle, LocalizationPanelProps>(
  (
    {
      poiId,
      baseLanguage,
      role,
      disabled = false,
      onDirtyChange,
      onGlobalSaveRequest,
      className,
    },
    ref
  ) => {
    const isShopOwner = role === 'shopOwner';
    const { languages: supportedLanguages } = useSupportedLanguages(role);
    const [pendingLanguages, setPendingLanguages] = useState<string[]>(() =>
      isShopOwner ? listPendingTranslationRequests(poiId) : []
    );
    const [state, setState] = useState<LocalizationPanelState>({
      supportedLanguages,
      selectedLanguages: [baseLanguage],
      expandedLanguages: new Set(),
      showConflictModal: false,
      conflictDiffs: [],
      isStale: false,
      staleBanner: false,
    });

    const localizationHook = usePoiLocalizations(poiId, {
      clientConfig: {
        baseUrl: '/admin-api',
        authMode: 'bearer',
      },
      onDirtyChange: (dirtyCount) => {
        onDirtyChange?.(dirtyCount > 0);
      },
      onMutationStart: () => {
        // Reserved for future loading state.
      },
      onError: (error: Error) => {
        console.error('Localization error:', error);
        if ((error as { status?: number }).status === 409) {
          setState((prev) => ({
            ...prev,
            showConflictModal: true,
            conflictDiffs: [],
          }));
        }
      },
    });

    useEffect(() => {
      setState((prev) => ({
        ...prev,
        supportedLanguages,
      }));
    }, [supportedLanguages]);

    useEffect(() => {
      if (isShopOwner) {
        setPendingLanguages(listPendingTranslationRequests(poiId));
      }
    }, [isShopOwner, poiId]);

    const localizationByLanguage = useMemo(
      () => buildLocalizationMap(localizationHook.state.items || []),
      [localizationHook.state.items]
    );
    const dirtyMap = localizationHook.state.dirtyMap;
    const draftByLanguage = localizationHook.state.draftByLanguage;
    const pendingSet = useMemo(
      () => new Set(pendingLanguages.map((language) => languageKey(language as BCP47Language))),
      [pendingLanguages]
    );

    useEffect(() => {
      const visibleLanguageCount = isShopOwner
        ? supportedLanguages.filter((language) => language.enabled).length
        : state.selectedLanguages.length;

      localizationAnalytics.emitDropdownView({
        poiId,
        role,
        languageCount: visibleLanguageCount,
        timestamp: Date.now(),
      });
    }, [isShopOwner, poiId, role, supportedLanguages, state.selectedLanguages.length]);

    const handleAddLanguage = (language: BCP47Language) => {
      setState((prev) => ({
        ...prev,
        selectedLanguages: Array.from(new Set([...prev.selectedLanguages, language])),
      }));

      localizationAnalytics.emitAction({
        action: 'add_language',
        language,
        poiId,
        role,
        timestamp: Date.now(),
        success: true,
      });
    };

    const handleRemoveLanguage = (language: BCP47Language) => {
      if (language === baseLanguage) return;

      setState((prev) => ({
        ...prev,
        selectedLanguages: prev.selectedLanguages.filter((item) => item !== language),
      }));
    };

    const handleRequestTranslation = (language: BCP47Language) => {
      const key = languageKey(language);

      if (isTranslationRequestPending(poiId, language)) {
        localizationAnalytics.emitAction({
          action: 'request_translation_blocked',
          language,
          poiId,
          role,
          timestamp: Date.now(),
          success: false,
          errorMessage: 'Request already pending',
        });
        return;
      }

      markTranslationRequestPending(poiId, language);
      setPendingLanguages(listPendingTranslationRequests(poiId));

      localizationAnalytics.emitAction({
        action: 'request_translation',
        language,
        poiId,
        role,
        timestamp: Date.now(),
        success: true,
      });

      localizationAnalytics.emitPendingState({
        poiId,
        language: key,
        role,
        timestamp: Date.now(),
        pending: true,
      });
    };

    const handleReloadLatest = async () => {
      setState((prev) => ({
        ...prev,
        showConflictModal: false,
        conflictDiffs: [],
      }));

      await localizationHook.refetch();
    };

    const handleOverwriteAnyway = async () => {
      const dirtyLanguages = Object.keys(dirtyMap).filter((language) => dirtyMap[language]);

      for (const language of dirtyLanguages) {
        await localizationHook.saveLanguage(language as BCP47Language);
      }

      setState((prev) => ({
        ...prev,
        showConflictModal: false,
        conflictDiffs: [],
      }));
    };

    useImperativeHandle(
      ref,
      () => ({
        async flush() {
          return 'clean';
        },
        async saveLanguage(language) {
          await localizationHook.saveLanguage(language);
        },
        async saveAllDirty() {
          const dirtyLanguages = Object.keys(dirtyMap).filter((language) => dirtyMap[language]);
          for (const language of dirtyLanguages) {
            await localizationHook.saveLanguage(language as BCP47Language);
          }
        },
        async refetch() {
          await localizationHook.refetch();
        },
        hasDirtyChanges() {
          return Object.values(dirtyMap).some(Boolean);
        },
        getDirtyLanguages() {
          return Object.keys(dirtyMap).filter((language) => dirtyMap[language]) as BCP47Language[];
        },
      }),
      [dirtyMap, localizationHook]
    );

    const adminLanguages = state.selectedLanguages;
    const shopOwnerLanguages = supportedLanguages.filter((language) => language.enabled);
    const languagesToRender = isShopOwner ? shopOwnerLanguages : adminLanguages;

    return (
      <>
        <div className={`${styles.panel} ${className ?? ''}`.trim()}>
          <div className={styles.header}>
            <h3>Translations</h3>
            {!isShopOwner && (
              <button
                disabled={disabled}
                onClick={() => {
                  const nextLanguage = supportedLanguages.find(
                    (language) => !state.selectedLanguages.includes(language.code)
                  );

                  if (nextLanguage) {
                    handleAddLanguage(nextLanguage.code);
                  }
                }}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: disabled ? '#e5e7eb' : '#3b82f6',
                  color: '#fff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Plus size={14} />
                Add Language
              </button>
            )}
          </div>

          <div className={styles.accordion}>
            {languagesToRender.map((language) => {
              const languageCode = language.code as BCP47Language;
              const key = languageKey(languageCode);
              const localization = localizationByLanguage.get(key);
              const draft = draftByLanguage[key];
              const requestPending = pendingSet.has(key);

              return (
                <LocalizationAccordionItem
                  key={key}
                  language={languageCode}
                  localization={localization}
                  draft={draft}
                  isDirty={Boolean(dirtyMap[key])}
                  isLocked={isShopOwner && !language.shopOwnerEditable}
                  supportedLanguageInfo={language}
                  isBaseLanguage={languageCode === baseLanguage}
                  onEdit={(updatedLanguage, updates) => {
                    localizationHook.editLanguage(updatedLanguage, updates);
                  }}
                  onSave={(updatedLanguage) => localizationHook.saveLanguage(updatedLanguage)}
                  onDiscard={(updatedLanguage) => localizationHook.discardLanguage(updatedLanguage)}
                  onDelete={(updatedLanguage) => localizationHook.deleteLanguage(updatedLanguage)}
                  onRequestTranslation={handleRequestTranslation}
                  disabled={disabled}
                  poiId={poiId}
                  role={role}
                  mode={isShopOwner ? 'shopOwner' : 'admin'}
                  requestPending={requestPending}
                />
              );
            })}
          </div>
        </div>

        {state.showConflictModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Conflicting Changes Detected</h3>
              <p>Another user modified the content while you were editing.</p>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleReloadLatest}>
                  Reload Latest
                </button>
                <button type="button" onClick={handleOverwriteAnyway}>
                  Overwrite Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

LocalizationPanel.displayName = 'LocalizationPanel';

export default LocalizationPanel;
export type { LocalizationPanelHandle, LocalizationPanelProps };
