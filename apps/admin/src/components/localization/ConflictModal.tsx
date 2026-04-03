// ConflictModal.tsx
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type { LocalizationDiff } from '@localization-shared';

export interface ConflictModalProps {
  diffs: LocalizationDiff[];
  onReloadLatest: () => void;
  onOverwriteAnyway: () => void;
  isLoading?: boolean;
  onClose?: () => void;
}

export function ConflictModal({
  diffs,
  onReloadLatest,
  onOverwriteAnyway,
  isLoading = false,
  onClose
}: ConflictModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
      onClick={() => onClose?.()}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} style={{ color: '#dc2626' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
              Conflicting Changes Detected
            </h2>
          </div>
          <button
            onClick={() => onClose?.()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Another user modified the content while you were editing. Please choose how to proceed:
          </p>

          {diffs.length > 0 && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.75rem' }}>
                Changed fields:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {diffs.map((diff) => (
                  <div key={`${diff.language}-${diff.field}`} style={{ fontSize: '0.875rem' }}>
                    <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      {diff.field}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          Your version:
                        </p>
                        <p
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#fef2f2',
                            borderRadius: '0.375rem',
                            color: '#374151',
                            fontSize: '0.8rem',
                            wordBreak: 'break-word'
                          }}
                        >
                          {String(diff.local).substring(0, 100)}
                          {String(diff.local).length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          Latest version:
                        </p>
                        <p
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '0.375rem',
                            color: '#374151',
                            fontSize: '0.8rem',
                            wordBreak: 'break-word'
                          }}
                        >
                          {String(diff.remote).substring(0, 100)}
                          {String(diff.remote).length > 100 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onReloadLatest}
            disabled={isLoading}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#f9fafb',
              color: '#374151',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Reload Latest
          </button>
          <button
            onClick={onOverwriteAnyway}
            disabled={isLoading}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '0.375rem',
              border: '1px solid #fee2e2',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Overwrite Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
