import { drive_v3 } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const BACKUP_FILE_NAME = 'gratis-training-backup.json';

export interface GoogleAuthTokens {
  accessToken: string;
  expiresAt?: number | null;
}

let oauth2Client: InstanceType<typeof OAuth2Client> | null = null;

/**
 * Initialize OAuth2 client
 */
export function initializeGoogleAuth() {
  if (oauth2Client) {
    return oauth2Client;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.CLIENT_ORIGIN}auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  oauth2Client = new OAuth2Client({ clientId, clientSecret, redirectUri });
  return oauth2Client;
}

/**
 * Get Google OAuth authorization URL
 */
export function getAuthorizationUrl(): string {
  const oAuth2Client = initializeGoogleAuth();
  return oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleAuthTokens> {
  const oAuth2Client = initializeGoogleAuth();

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    return {
      accessToken: tokens.access_token || '',
      expiresAt: tokens.expiry_date,
    };
  } catch (error) {
    throw new Error(
      `Failed to exchange code for tokens: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Create authenticated OAuth2 client with access token
 */
function createAuthenticatedClient(accessToken: string) {
  const oAuth2Client = initializeGoogleAuth();
  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

/**
 * Find backup file in Google Drive
 */
async function findBackupFile(accessToken: string): Promise<string | null> {
  const auth = createAuthenticatedClient(accessToken);
  const drive = new drive_v3.Drive({ auth });

  try {
    const response = await drive.files.list({
      q: `name='${BACKUP_FILE_NAME}' and trashed=false`,
      fields: 'files(id)',
      pageSize: 1,
    });

    return response.data.files?.[0]?.id || null;
  } catch (error) {
    throw new Error(
      `Failed to search Google Drive: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Upload backup to Google Drive
 */
export async function uploadBackupToGoogleDrive(
  accessToken: string,
  backupData: unknown
): Promise<string> {
  const auth = createAuthenticatedClient(accessToken);
  const drive = new drive_v3.Drive({ auth });

  try {
    const jsonContent = JSON.stringify(backupData);
    const existingFileId = await findBackupFile(accessToken);

    if (existingFileId) {
      // Update existing file
      await drive.files.update({
        fileId: existingFileId,
        media: {
          mimeType: 'application/json',
          body: jsonContent,
        },
      });
      return existingFileId;
    } else {
      // Create new file
      const response = await drive.files.create({
        requestBody: {
          name: BACKUP_FILE_NAME,
        },
        media: {
          mimeType: 'application/json',
          body: jsonContent,
        },
        fields: 'id',
      });

      return response.data.id || '';
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
 * Download backup from Google Drive
 */
export async function downloadBackupFromGoogleDrive(
  accessToken: string
): Promise<unknown> {
  const auth = createAuthenticatedClient(accessToken);
  const drive = new drive_v3.Drive({ auth });

  try {
    const fileId = await findBackupFile(accessToken);
    if (!fileId) {
      throw new Error('No backup file found on Google Drive');
    }

    const response = await drive.files.get({
      fileId,
      alt: 'media',
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to download from Google Drive: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
