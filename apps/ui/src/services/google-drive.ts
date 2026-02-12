import type { BackupData } from './backup';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Store access token and expiration time in sessionStorage
 */
export function storeAccessToken(accessToken: string, expiresAt?: number): void {
  sessionStorage.setItem('google_access_token', accessToken);
  if (expiresAt) {
    sessionStorage.setItem('google_token_expires_at', expiresAt.toString());
  }
}

/**
 * Check if token has expired
 */
function isTokenExpired(): boolean {
  const expiresAt = sessionStorage.getItem('google_token_expires_at');
  if (!expiresAt) {
    return false; // No expiration time stored, assume valid
  }
  return Date.now() >= parseInt(expiresAt, 10);
}

/**
 * Check if user is authenticated and token is not expired
 */
export function isGoogleDriveAuthorized(): boolean {
  const token = sessionStorage.getItem('google_access_token');
  if (!token) {
    return false;
  }
  if (isTokenExpired()) {
    clearGoogleDriveAuth();
    return false;
  }
  return true;
}

/**
 * Get Google Drive API token (returns null if expired)
 */
export function getGoogleDriveToken(): string | null {
  if (isTokenExpired()) {
    clearGoogleDriveAuth();
    return null;
  }
  return sessionStorage.getItem('google_access_token');
}

/**
 * Clear Google Drive authentication
 */
export function clearGoogleDriveAuth(): void {
  sessionStorage.removeItem('google_access_token');
  sessionStorage.removeItem('google_token_expires_at');
}

/**
 * Get Google OAuth authorization URL from backend
 */
export async function getGoogleAuthUrl(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth-url`);
    if (!response.ok) {
      throw new Error('Failed to get auth URL');
    }
    const data = (await response.json()) as { url: string };
    return data.url;
  } catch (error) {
    throw new Error(
      `Failed to get Google auth URL: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Exchange authorization code for access tokens (backend handles this)
 */
export async function exchangeCodeForToken(code: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = (await response.json()) as {
      accessToken: string;
      expiresAt: number;
    };
    storeAccessToken(data.accessToken, data.expiresAt);
  } catch (error) {
    throw new Error(
      `Failed to exchange code: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Upload backup to Google Drive via backend
 */
export async function uploadBackupToGoogleDrive(
  backup: BackupData
): Promise<void> {
  const token = getGoogleDriveToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ backup }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to upload to Google Drive: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Download backup from Google Drive via backend
 */
export async function downloadBackupFromGoogleDrive(): Promise<BackupData> {
  const token = getGoogleDriveToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const backup = (await response.json()) as BackupData;
    return backup;
  } catch (error) {
    throw new Error(
      `Failed to download from Google Drive: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
