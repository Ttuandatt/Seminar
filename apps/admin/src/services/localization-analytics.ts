// analytics.ts - Localization analytics events
import type { BCP47Language } from '@localization-shared';

export type LocalizationActionType =
  | 'save'
  | 'delete'
  | 'discard'
  | 'add_language'
  | 'generate_audio'
  | 'conflict_reload'
  | 'conflict_overwrite'
  | 'request_translation'
  | 'request_translation_blocked'
  | 'pending_state_shown';

export interface LocalizationActionEvent {
  action: LocalizationActionType;
  language: BCP47Language;
  poiId: string;
  role: 'admin' | 'shopOwner';
  timestamp: number;
  duration?: number; // milliseconds
  success?: boolean;
  errorMessage?: string;
}

export interface LocalizationDropdownViewEvent {
  poiId: string;
  role: 'admin' | 'shopOwner';
  languageCount: number;
  timestamp: number;
}

export interface LocalizationPendingStateEvent {
  poiId: string;
  language: string;
  role: 'admin' | 'shopOwner';
  timestamp: number;
  pending: boolean;
}

class LocalizationAnalytics {
  private listeners: Set<
    (event: LocalizationActionEvent | LocalizationDropdownViewEvent | LocalizationPendingStateEvent) => void
  > = new Set();

  /**
   * Subscribe to analytics events
   */
  subscribe(listener: (event: LocalizationActionEvent | LocalizationDropdownViewEvent | LocalizationPendingStateEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit a localization pending-state event
   */
  emitPendingState(event: LocalizationPendingStateEvent) {
    console.log('[LocalizationAnalytics] Pending state:', event);
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Analytics listener error:', error);
      }
    });

    this.sendToBackend('localization_pending_state', event);
  }

  /**
   * Emit a localization action event
   */
  emitAction(event: LocalizationActionEvent) {
    console.log('[LocalizationAnalytics] Action:', event.action, event);
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Analytics listener error:', error);
      }
    });

    // Optional: Send to backend for persistent storage
    this.sendToBackend('localization_action', event);
  }

  /**
   * Emit a dropdown view event
   */
  emitDropdownView(event: LocalizationDropdownViewEvent) {
    console.log('[LocalizationAnalytics] Dropdown view:', event);
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Analytics listener error:', error);
      }
    });

    // Optional: Send to backend for persistent storage
    this.sendToBackend('localization_dropdown_view', event);
  }

  /**
   * Send analytics to backend (if needed)
   */
  private sendToBackend(_eventName: string, _data: any) {
    // TODO: Implement if backend telemetry endpoint is available
    // fetch('/admin-api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ eventName, data })
    // }).catch(err => console.error('Failed to send analytics:', err));
  }

  /**
   * Track timing of an async operation
   */
  async trackTiming<T>(
    action: LocalizationActionType,
    language: BCP47Language,
    poiId: string,
    role: 'admin' | 'shopOwner',
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.emitAction({
        action,
        language,
        poiId,
        role,
        timestamp: startTime,
        duration,
        success: true
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emitAction({
        action,
        language,
        poiId,
        role,
        timestamp: startTime,
        duration,
        success: false,
        errorMessage
      });
      throw error;
    }
  }
}

export const localizationAnalytics = new LocalizationAnalytics();
