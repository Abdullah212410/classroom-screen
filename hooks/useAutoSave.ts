import { useEffect, useRef, useCallback } from 'react';

const AUTOSAVE_VERSION = 1;
const AUTOSAVE_KEY_PREFIX = 'classroom_autosave_';
const AUTOSAVE_DEBOUNCE_MS = 600;

interface AutoSaveMetadata {
  version: number;
  timestamp: number;
  checksum?: string;
}

interface AutoSaveData<T> {
  metadata: AutoSaveMetadata;
  data: T;
}

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  onRestore?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Auto-save hook with versioning, debouncing, and error handling
 * Automatically saves data to localStorage and restores on mount
 */
export function useAutoSave<T>({
  key,
  data,
  enabled = true,
  debounceMs = AUTOSAVE_DEBOUNCE_MS,
  onRestore,
  onError
}: UseAutoSaveOptions<T>) {
  const storageKey = `${AUTOSAVE_KEY_PREFIX}${key}`;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');
  const isRestoredRef = useRef(false);

  // Save to localStorage with error handling
  const saveToStorage = useCallback((dataToSave: T) => {
    if (!enabled) return;

    try {
      const serialized = JSON.stringify(dataToSave);

      // Skip if data hasn't changed (optimization)
      if (serialized === lastSaveRef.current) return;

      const autoSaveData: AutoSaveData<T> = {
        metadata: {
          version: AUTOSAVE_VERSION,
          timestamp: Date.now()
        },
        data: dataToSave
      };

      localStorage.setItem(storageKey, JSON.stringify(autoSaveData));
      lastSaveRef.current = serialized;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Auto-save failed');
      console.error('[AutoSave] Save error:', err);
      onError?.(err);

      // If quota exceeded, try to clear old auto-save data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          clearOldAutoSaves();
          // Retry save after clearing
          localStorage.setItem(storageKey, JSON.stringify({
            metadata: { version: AUTOSAVE_VERSION, timestamp: Date.now() },
            data: dataToSave
          }));
        } catch (retryError) {
          console.error('[AutoSave] Retry failed after quota cleanup:', retryError);
        }
      }
    }
  }, [enabled, storageKey, onError]);

  // Debounced save
  const debouncedSave = useCallback((dataToSave: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveToStorage(dataToSave);
    }, debounceMs);
  }, [saveToStorage, debounceMs]);

  // Restore from localStorage
  const restoreFromStorage = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed: AutoSaveData<T> = JSON.parse(stored);

      // Version migration
      if (parsed.metadata.version !== AUTOSAVE_VERSION) {
        console.warn('[AutoSave] Version mismatch, clearing old data');
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsed.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Auto-restore failed');
      console.error('[AutoSave] Restore error:', err);
      onError?.(err);

      // Clear corrupted data
      try {
        localStorage.removeItem(storageKey);
      } catch (clearError) {
        console.error('[AutoSave] Failed to clear corrupted data:', clearError);
      }

      return null;
    }
  }, [storageKey, onError]);

  // Restore on mount (once)
  useEffect(() => {
    if (!enabled || isRestoredRef.current) return;

    isRestoredRef.current = true;
    const restored = restoreFromStorage();

    if (restored && onRestore) {
      onRestore(restored);
    }
  }, [enabled, restoreFromStorage, onRestore]);

  // Auto-save when data changes
  useEffect(() => {
    if (!enabled) return;
    debouncedSave(data);
  }, [data, debouncedSave, enabled]);

  // Save on visibility change (user switching tabs)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear debounce and save immediately
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        saveToStorage(data);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, data, saveToStorage]);

  // Save on beforeunload (page close/refresh)
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      // Clear debounce and save immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveToStorage(data);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, data, saveToStorage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    save: () => saveToStorage(data),
    restore: restoreFromStorage,
    clear: () => {
      try {
        localStorage.removeItem(storageKey);
        lastSaveRef.current = '';
      } catch (error) {
        console.error('[AutoSave] Clear error:', error);
      }
    }
  };
}

// Clear old auto-save entries (older than 7 days)
function clearOldAutoSaves() {
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(AUTOSAVE_KEY_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed: AutoSaveData<any> = JSON.parse(value);
            if (now - parsed.metadata.timestamp > maxAge) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid entry, mark for removal
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[AutoSave] Cleared ${keysToRemove.length} old entries`);
  } catch (error) {
    console.error('[AutoSave] Failed to clear old saves:', error);
  }
}
