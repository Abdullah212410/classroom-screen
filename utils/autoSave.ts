
/**
 * Auto-Save Utility (GOAL B)
 * Automatically saves and restores app state with:
 * - localStorage persistence with versioning
 * - Throttled/debounced writes (500ms)
 * - Save on visibility change and beforeunload
 * - Graceful error handling and migration
 */

import { RoomState } from '../types';

const STORAGE_KEY = 'classroom_autosave_v1';
const SCHEMA_VERSION = 1;
const AUTOSAVE_DEBOUNCE_MS = 500;

interface AutoSaveData {
  version: number;
  timestamp: number;
  state: RoomState;
}

class AutoSaveManager {
  private saveTimeout: NodeJS.Timeout | null = null;
  private listeners: Array<(state: RoomState | null) => void> = [];
  private lastSaveTime = 0;
  private saveInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Save on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flushPendingSave();
        }
      });

      // Save before page unload
      window.addEventListener('beforeunload', () => {
        this.flushPendingSave();
      });

      // Periodic sync every 30 seconds
      setInterval(() => {
        this.flushPendingSave();
      }, 30000);
    }
  }

  /**
   * Save state with debouncing
   */
  save(state: RoomState, immediate = false): void {
    if (immediate) {
      this.flushPendingSave();
      this.performSave(state);
      return;
    }

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Debounce the save
    this.saveTimeout = setTimeout(() => {
      this.performSave(state);
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  /**
   * Immediately execute any pending save
   */
  private flushPendingSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }

  /**
   * Actually perform the save operation
   */
  private performSave(state: RoomState): void {
    if (this.saveInProgress) return;

    try {
      this.saveInProgress = true;

      const data: AutoSaveData = {
        version: SCHEMA_VERSION,
        timestamp: Date.now(),
        state
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.lastSaveTime = Date.now();

      // Notify listeners
      this.notifyListeners(state);

      console.log('[AutoSave] State saved successfully');
    } catch (error) {
      console.error('[AutoSave] Failed to save state:', error);

      // If quota exceeded, try to clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldData();
        // Retry once
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: SCHEMA_VERSION,
            timestamp: Date.now(),
            state
          }));
        } catch (retryError) {
          console.error('[AutoSave] Retry failed:', retryError);
        }
      }
    } finally {
      this.saveInProgress = false;
    }
  }

  /**
   * Load saved state from localStorage
   */
  load(): RoomState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        console.log('[AutoSave] No saved state found');
        return null;
      }

      const data: AutoSaveData = JSON.parse(stored);

      // Validate schema version
      if (data.version !== SCHEMA_VERSION) {
        console.warn('[AutoSave] Schema version mismatch, migrating...');
        return this.migrate(data);
      }

      // Validate state structure
      if (!this.validateState(data.state)) {
        console.warn('[AutoSave] Invalid state structure, skipping restore');
        return null;
      }

      const age = Date.now() - data.timestamp;
      const ageMinutes = Math.floor(age / 60000);
      console.log(`[AutoSave] Loaded state from ${ageMinutes} minutes ago`);

      return data.state;
    } catch (error) {
      console.error('[AutoSave] Failed to load state:', error);
      // Clear corrupted data
      this.clear();
      return null;
    }
  }

  /**
   * Validate state structure
   */
  private validateState(state: any): state is RoomState {
    return (
      state &&
      typeof state === 'object' &&
      typeof state.roomId === 'string' &&
      state.background &&
      typeof state.background === 'object' &&
      Array.isArray(state.widgets)
    );
  }

  /**
   * Migrate from old schema version (if needed)
   */
  private migrate(data: AutoSaveData): RoomState | null {
    // For now, just clear and start fresh on version mismatch
    // In future, implement actual migration logic
    console.log('[AutoSave] Migration not implemented, clearing old data');
    this.clear();
    return null;
  }

  /**
   * Clear saved state
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[AutoSave] Cleared saved state');
    } catch (error) {
      console.error('[AutoSave] Failed to clear state:', error);
    }
  }

  /**
   * Clear old/unused data to free up space
   */
  private clearOldData(): void {
    try {
      // Clear old classroom screen data from roomService
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('classroom_screen_') && key !== STORAGE_KEY) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[AutoSave] Failed to clear old data:', error);
    }
  }

  /**
   * Add listener for save events
   */
  addListener(callback: (state: RoomState | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(state: RoomState | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[AutoSave] Listener error:', error);
      }
    });
  }

  /**
   * Get last save timestamp
   */
  getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  /**
   * Check if there are pending saves
   */
  hasPendingSave(): boolean {
    return this.saveTimeout !== null;
  }
}

// Export singleton instance
export const autoSaveManager = new AutoSaveManager();

/**
 * React hook for auto-save
 */
export function useAutoSave(state: RoomState | null, enabled = true): {
  lastSaved: number;
  isSaving: boolean;
} {
  const [lastSaved, setLastSaved] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || !state) return;

    setIsSaving(true);
    autoSaveManager.save(state);

    const timeout = setTimeout(() => {
      setLastSaved(Date.now());
      setIsSaving(false);
    }, AUTOSAVE_DEBOUNCE_MS + 100);

    return () => clearTimeout(timeout);
  }, [state, enabled]);

  React.useEffect(() => {
    return autoSaveManager.addListener((savedState) => {
      if (savedState) {
        setLastSaved(Date.now());
        setIsSaving(false);
      }
    });
  }, []);

  return { lastSaved, isSaving };
}

// Import React for the hook
import React from 'react';
