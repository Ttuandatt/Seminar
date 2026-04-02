// LocalizationPanelAccordion.tsx
import React, { useState } from 'react';
import { ChevronDown, FileText, Trash2, Loader2 } from 'lucide-react';
import { PoiLocalization, BCP47Language, SupportedLanguage } from '@localization-shared';
import styles from './LocalizationPanel.module.css';

export interface AccordionItemProps {
  language: BCP47Language;
  localization: PoiLocalization | undefined;
  draft: PoiLocalization | undefined;
  isDirty: boolean;
  isLocked: boolean;
  supportedLanguageInfo: SupportedLanguage | undefined;
  isBaseLanguage: boolean;
  onEdit: (language: BCP47Language, updates: Partial<PoiLocalization>) => void;
  onSave: (language: BCP47Language) => Promise<void>;
  onDiscard: (language: BCP47Language) => void;
  onDelete: (language: BCP47Language) => Promise<void>;
  onGenerateAudio?: (language: BCP47Language) => void;
  disabled?: boolean;
}

export function LocalizationAccordionItem({
  language,
  localization,
  draft,
  isDirty,
  isLocked,
  supportedLanguageInfo,
  isBaseLanguage,
  onEdit,
  onSave,
  onDiscard,
  onDelete,
  onGenerateAudio,
  disabled = false
}: AccordionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentData = draft || localization;
  if (!currentData) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(language);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${language} localization?`)) {
      setIsDeleting(true);
      try {
        await onDelete(language);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={styles.accordionItem}>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <ChevronDown
            size={16}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms'
            }}
          />
          <span>{language}</span>
          {isDirty && (
            <span
              style={{
                display: 'inline-block',
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                marginLeft: '0.5rem'
              }}
              title="Unsaved changes"
            />
          )}
          {isLocked && (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                marginLeft: '0.5rem'
              }}
            >
              (locked)
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div style={{ padding: '1rem', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={currentData.name || ''}
              onChange={(e) =>
                onEdit(language, { name: e.target.value })
              }
              disabled={disabled || isLocked}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                backgroundColor: isLocked ? '#f0f0f0' : 'white',
                opacity: disabled || isLocked ? 0.6 : 1
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}
            >
              Description
            </label>
            <textarea
              value={currentData.description || ''}
              onChange={(e) =>
                onEdit(language, { description: e.target.value })
              }
              disabled={disabled || isLocked}
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                backgroundColor: isLocked ? '#f0f0f0' : 'white',
                opacity: disabled || isLocked ? 0.6 : 1,
                fontFamily: 'inherit',
                resize: 'none'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={handleSave}
              disabled={!isDirty || disabled || isSaving}
              type="button"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: !isDirty || disabled ? '#e5e7eb' : '#3b82f6',
                color: '#fff',
                cursor: !isDirty || disabled ? 'not-allowed' : 'pointer',
                opacity: !isDirty || disabled ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={() => onDiscard(language)}
              disabled={!isDirty || disabled}
              type="button"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                backgroundColor: '#fff',
                color: '#374151',
                cursor: !isDirty || disabled ? 'not-allowed' : 'pointer',
                opacity: !isDirty || disabled ? 0.6 : 1
              }}
            >
              Discard
            </button>

            {supportedLanguageInfo?.supportsTts && (
              <button
                onClick={() => onGenerateAudio?.(language)}
                disabled={disabled}
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: '1px solid #dbeafe',
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                Generate Audio
              </button>
            )}

            {!isBaseLanguage && (
              <button
                onClick={handleDelete}
                disabled={disabled || isDeleting}
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  cursor: disabled || isDeleting ? 'not-allowed' : 'pointer',
                  opacity: disabled || isDeleting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
