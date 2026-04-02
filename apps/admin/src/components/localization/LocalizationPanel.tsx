// LocalizationPanel.tsx
import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef } from 'react';
import {
  usePoiLocalizations,
  LocalizationClientConfig,
  BCP47Language
} from '@localization-shared';
import { LocalizationPanelProps, LocalizationPanelHandle, LocalizationPanelState } from './LocalizationPanel.types';
import styles from './LocalizationPanel.module.css';

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
    const [state, setState] = useState<LocalizationPanelState>({
      supportedLanguages: [],
      selectedLanguages: [baseLanguage],
      expandedLanguages: new Set(),
      showConflictModal: false,
      conflictDiffs: [],
      isStale: false,
      staleBanner: false
    });

    const localizationHook = usePoiLocalizations(poiId, {
      clientConfig: {
        baseUrl: '/admin-api',
        authMode: 'bearer'
      },
      onDirtyChange,
      onMutationStart: () => {
        // Show loading UI
      },
      onError: (error) => {
        console.error('Localization error:', error);
      }
    });

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

    return (
      <div className={`${styles.panel} ${className}`}>
        <div className={styles.header}>
          <h3>Translations ({state.selectedLanguages.length})</h3>
          <button disabled={disabled}>Add Language</button>
        </div>

        <div className={styles.accordion}>
          {/* Accordion items will be rendered here */}
          {state.selectedLanguages.map((lang) => (
            <div key={lang} className={styles.accordionItem}>
              <button className={styles.accordionHeader}>
                {lang}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

LocalizationPanel.displayName = 'LocalizationPanel';

export default LocalizationPanel;
export type { LocalizationPanelHandle, LocalizationPanelProps };
