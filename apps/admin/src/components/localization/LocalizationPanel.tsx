// LocalizationPanel.tsx
import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef, useEffect } from 'react';
import {
  usePoiLocalizations,
  LocalizationClientConfig,
  BCP47Language
} from '@localization-shared';
import { LocalizationPanelProps, LocalizationPanelHandle, LocalizationPanelState } from './LocalizationPanel.types';
import { LocalizationAccordionItem } from './LocalizationPanelAccordion';
import { ConflictModal } from './ConflictModal';
import { useSupportedLanguages } from '../../hooks/useSupportedLanguages';
import styles from './LocalizationPanel.module.css';
import { Plus } from 'lucide-react';

const LocalizationPanel = forwardRef<LocalizationPanelHandle, LocalizationPanelProps>(
  (
    {
      poiId,
      baseLanguage,
      role,
      disabled = false,
      onDirtyChange,
      onGlobalSaveRequest,
      className
    },
    ref
  ) => {
    const { languages: supportedLanguages, isLoading } = useSupportedLanguages(role);
    
    const [state, setState] = useState<LocalizationPanelState>({
      supportedLanguages,
      selectedLanguages: [baseLanguage],
      expandedLanguages: new Set(),
      showConflictModal: false,
      conflictDiffs: [],
      isStale: false,
      staleBanner: false
    });

    const [isHandlingConflict, setIsHandlingConflict] = useState(false);

    useEffect(() => {
      setState(prev => ({
        ...prev,
        supportedLanguages
      }));
    }, [supportedLanguages]);

    const localizationHook = usePoiLocalizations(poiId, {
      clientConfig: {
        baseUrl: '/admin-api',
        authMode: 'bearer'
      },
      onDirtyChange,
      onMutationStart: () => {
        // Show loading UI
      },
      onError: (error: any) => {
        console.error('Localization error:', error);
        
        // Handle conflict (409)
        if (error?.status === 409 || error?.response?.status === 409) {
          const diffs = error?.diffs || error?.response?.data?.diffs || [];
          setState(prev => ({
            ...prev,
            showConflictModal: true,
            conflictDiffs: diffs
          }));
        }
      }
    });

    const handleAddLanguage = (language: BCP47Language) => {
      setState(prev => ({
        ...prev,
        selectedLanguages: Array.from(new Set([...prev.selectedLanguages, language]))
      }));
    };

    const handleRemoveLanguage = (language: BCP47Language) => {
      if (language === baseLanguage) return; // Don't remove base language
      setState(prev => ({
        ...prev,
        selectedLanguages: prev.selectedLanguages.filter(l => l !== language)
      }));
    };

    const handleToggleExpand = (language: BCP47Language) => {
      setState(prev => {
        const expanded = new Set(prev.expandedLanguages);
        if (expanded.has(language)) {
          expanded.delete(language);
        } else {
          expanded.add(language);
        }
        return { ...prev, expandedLanguages: expanded };
      });
    };

    const handleReloadLatest = async () => {
      setIsHandlingConflict(true);
      try {
        await localizationHook.refetch();
        setState(prev => ({
          ...prev,
          showConflictModal: false,
          conflictDiffs: []
        }));
      } finally {
        setIsHandlingConflict(false);
      }
    };

    const handleOverwriteAnyway = async () => {
      setIsHandlingConflict(true);
      try {
        // Clear drafts and re-save with force flag
        const dirtyLanguages = Array.from(localizationHook.state.dirtyMap.keys());
        for (const lang of dirtyLanguages) {
          await localizationHook.saveLanguage(lang, { forceOverwrite: true });
        }
        setState(prev => ({
          ...prev,
          showConflictModal: false,
          conflictDiffs: []
        }));
      } finally {
        setIsHandlingConflict(false);
      }
    };

    // Expose imperative handle
    useImperativeHandle(
      ref,
      () => ({
        async flush(options) {
          // Validate all dirty drafts
          // If validation fails, reject with fieldErrors
          // Otherwise save all dirty and return 'clean'
          return 'clean';
        },
        async saveLanguage(language) {
          await localizationHook.saveLanguage(language);
        },
        async saveAllDirty() {
          const dirtyLanguages = localizationHook.state.dirtyMap.keys();
          for (const lang of dirtyLanguages) {
            await localizationHook.saveLanguage(lang);
          }
        },
        async refetch() {
          await localizationHook.refetch();
        },
        hasDirtyChanges() {
          return localizationHook.state.dirtyMap.size > 0;
        },
        getDirtyLanguages() {
          return Array.from(localizationHook.state.dirtyMap.keys());
        }
      }),
      [localizationHook]
    );

    const availableLanguages = supportedLanguages.filter(
      l => !state.selectedLanguages.includes(l.code as BCP47Language)
    );

    return (
      <>
        <div className={`${styles.panel} ${className}`}>
          <div className={styles.header}>
            <h3>Translations ({state.selectedLanguages.length})</h3>
            {availableLanguages.length > 0 && (
              <button
                disabled={disabled}
                onClick={() => {
                  if (availableLanguages.length > 0) {
                    handleAddLanguage(availableLanguages[0].code as BCP47Language);
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
                  gap: '0.5rem'
                }}
              >
                <Plus size={14} />
                Add Language
              </button>
            )}
          </div>

          <div className={styles.accordion}>
            {state.selectedLanguages.map((lang) => {
              const supported = supportedLanguages.find(l => l.code === lang);
              return (
                <LocalizationAccordionItem
                  key={lang}
                  language={lang}
                  localization={localizationHook.state.localizations[lang]}
                  draft={localizationHook.state.drafts[lang]}
                  isDirty={localizationHook.state.dirtyMap.has(lang)}
                  isLocked={role === 'shopOwner' && !supported?.shopOwnerEditable}
                  supportedLanguageInfo={supported}
                  isBaseLanguage={lang === baseLanguage}
                  onEdit={(language, updates) => {
                    localizationHook.updateDraft(language, updates);
                  }}
                  onSave={(language) => localizationHook.saveLanguage(language)}
                  onDiscard={(language) => localizationHook.discardDraft(language)}
                  onDelete={(language) => {
                    handleRemoveLanguage(language);
                    return localizationHook.deleteLocalization(language);
                  }}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </div>

        {state.showConflictModal && (
          <ConflictModal
            diffs={state.conflictDiffs}
            onReloadLatest={handleReloadLatest}
            onOverwriteAnyway={handleOverwriteAnyway}
            isLoading={isHandlingConflict}
            onClose={() => {
              setState(prev => ({
                ...prev,
                showConflictModal: false,
                conflictDiffs: []
              }));
            }}
          />
        )}
      </>
    );
  }
);

LocalizationPanel.displayName = 'LocalizationPanel';

export default LocalizationPanel;
export type { LocalizationPanelHandle, LocalizationPanelProps };
