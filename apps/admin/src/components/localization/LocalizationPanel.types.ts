// LocalizationPanel.types.ts
import type { BCP47Language, SupportedLanguage } from '@localization-shared';

export type UserRole = 'admin' | 'shopOwner';

export interface LocalizationPanelProps {
  poiId: string;
  baseLanguage: BCP47Language;
  role: UserRole;
  disabled?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onGlobalSaveRequest?: (meta: { dirtyLanguages: string[] }) => void;
  className?: string;
}

export interface LocalizationPanelHandle {
  flush(options?: { reason: 'form-submit' | 'navigation' }): Promise<'clean' | 'blocked'>;
  saveLanguage(language: BCP47Language): Promise<void>;
  saveAllDirty(): Promise<void>;
  refetch(): Promise<void>;
  hasDirtyChanges(): boolean;
  getDirtyLanguages(): BCP47Language[];
}

export interface LocalizationPanelState {
  supportedLanguages: SupportedLanguage[];
  selectedLanguages: BCP47Language[];
  expandedLanguages: Set<BCP47Language>;
  showConflictModal: boolean;
  conflictDiffs: any[];
  isStale: boolean;
  staleBanner: boolean;
}
