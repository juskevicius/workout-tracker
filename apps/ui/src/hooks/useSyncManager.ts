import { useState, useCallback } from 'react';
import { exportDatabase, importDatabase } from '../services/backup';
import {
  isGoogleDriveAuthorized,
  uploadBackupToGoogleDrive,
  downloadBackupFromGoogleDrive,
  getGoogleDriveToken,
} from '../services/google-drive';

export interface SyncStatus {
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  isOnline: boolean;
}

export function useSyncManager() {
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    error: null,
    lastSync: localStorage.getItem('last_sync_time') || null,
    isOnline: navigator.onLine,
  });

  const updateStatus = useCallback((updates: Partial<SyncStatus>) => {
    setStatus((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Upload backup to Google Drive
   */
  const syncToGoogleDrive = useCallback(async () => {
    try {
      if (!isGoogleDriveAuthorized()) {
        throw new Error('Not authenticated with Google Drive');
      }
      updateStatus({ isLoading: true, error: null });
      const backup = await exportDatabase();
      await uploadBackupToGoogleDrive(backup);
      const now = new Date().toISOString();
      localStorage.setItem('last_sync_time', now);
      updateStatus({ isLoading: false, lastSync: now });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      updateStatus({ isLoading: false, error });
      throw err;
    }
  }, [updateStatus]);

  /**
   * Download backup from Google Drive
   */
  const syncFromGoogleDrive = useCallback(async () => {
    try {
      if (!isGoogleDriveAuthorized()) {
        throw new Error('Not authenticated with Google Drive');
      }
      updateStatus({ isLoading: true, error: null });
      const backup = await downloadBackupFromGoogleDrive();
      await importDatabase(backup);
      const now = new Date().toISOString();
      localStorage.setItem('last_sync_time', now);
      updateStatus({ isLoading: false, lastSync: now });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Download failed';
      updateStatus({ isLoading: false, error });
      throw err;
    }
  }, [updateStatus]);

  return {
    status,
    syncToGoogleDrive,
    syncFromGoogleDrive,
    hasGoogleToken: !!getGoogleDriveToken(),
  };
}
