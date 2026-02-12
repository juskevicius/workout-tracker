import express from 'express';
import {
  downloadBackupFromGoogleDrive,
  exchangeCodeForTokens,
  getAuthorizationUrl,
  uploadBackupToGoogleDrive,
} from './google-drive-sync-service';

const router = express.Router();

// Google Drive Sync Endpoints

/**
 * GET /api/sync/google/auth-url
 * Returns the Google OAuth authorization URL
 */
router.get('/auth-url', (req, res) => {
  try {
    const url = getAuthorizationUrl();
    return res.json({ url });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to generate auth URL',
    });
  }
});

/**
 * POST /api/sync/google/exchange-token
 * Exchanges authorization code for access token
 * Body: { code: string }
 */
router.post('/exchange-token', async (req, res) => {
  try {
    const { code } = req.body as { code: string };
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokens = await exchangeCodeForTokens(code);
    return res.json(tokens);
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to exchange token',
    });
  }
});

/**
 * POST /api/sync/google/upload
 * Uploads backup data to Google Drive
 * Headers: { Authorization: 'Bearer <accessToken>' }
 * Body: { backup: BackupData }
 */
router.post('/upload', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromHeaders(req);
    const { backup } = req.body as { backup: unknown };

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid authorization token' });
    }
    if (!backup) {
      return res.status(400).json({ error: 'Backup data is required' });
    }

    const fileId = await uploadBackupToGoogleDrive(accessToken, backup);
    return res.json({ fileId, success: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload backup',
    });
  }
});

/**
 * POST /api/sync/google/download
 * Downloads backup data from Google Drive
 * Headers: { Authorization: 'Bearer <accessToken>' }
 */
router.post('/download', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromHeaders(req);

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid authorization token' });
    }

    const backup = await downloadBackupFromGoogleDrive(accessToken);
    return res.json(backup);
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to download backup',
    });
  }
});

/**
 * Helper function to extract access token from Authorization header
 */
function getAccessTokenFromHeaders(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export { router };
