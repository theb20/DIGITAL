import { OAuth2Client, JWT } from 'google-auth-library';
import { drive_v3 } from '@googleapis/drive';
import { Readable } from 'stream';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_DRIVE_FOLDER_ID,
  GOOGLE_SA_CLIENT_EMAIL,
  GOOGLE_SA_PRIVATE_KEY,
} = process.env;

function normalizeFolderId(raw) {
  if (!raw) return raw;
  let v = String(raw).trim();
  // Strip surrounding quotes/backticks if present
  v = v.replace(/^['"`]+|['"`]+$/g, "");
  // If a full URL was provided, extract the ID after 'folders/'
  const m = v.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  return v;
}

function assertEnv() {
  const missing = [];
  const hasServiceAccount = Boolean(GOOGLE_SA_CLIENT_EMAIL && GOOGLE_SA_PRIVATE_KEY);
  if (!GOOGLE_DRIVE_FOLDER_ID) missing.push('GOOGLE_DRIVE_FOLDER_ID');
  if (!hasServiceAccount) {
    if (!GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    if (!GOOGLE_REDIRECT_URI) missing.push('GOOGLE_REDIRECT_URI');
    if (!GOOGLE_REFRESH_TOKEN) missing.push('GOOGLE_REFRESH_TOKEN');
  }
  if (missing.length) {
    throw new Error(`Google Drive config missing env: ${missing.join(', ')}`);
  }
}

export function getDriveClient() {
  assertEnv();
  const hasServiceAccount = Boolean(GOOGLE_SA_CLIENT_EMAIL && GOOGLE_SA_PRIVATE_KEY);

  let auth;
  if (hasServiceAccount) {
    // Use Service Account (recommended to avoid consent screen issues)
    const key = String(GOOGLE_SA_PRIVATE_KEY).replace(/\\n/g, '\n');
    auth = new JWT({
      email: GOOGLE_SA_CLIENT_EMAIL,
      key,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  } else {
    // Fallback to OAuth2 client with refresh token
    const oauth2 = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
    oauth2.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    auth = oauth2;
  }

  const drive = new drive_v3.Drive({ auth });
  return { drive, auth };
}

export async function uploadPublicFile({ name, mimeType, buffer }) {
  const { drive } = getDriveClient();
  const media = { mimeType, body: Readable.from(buffer) };
  const folderId = normalizeFolderId(GOOGLE_DRIVE_FOLDER_ID);
  const requestBody = { name, mimeType, parents: [folderId] };

  const { data } = await drive.files.create({
    requestBody,
    media,
    fields: 'id, name, mimeType, webViewLink, webContentLink'
  });

  // Make file publicly readable
  await drive.permissions.create({
    fileId: data.id,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  // Fetch links again to ensure availability
  const { data: file } = await drive.files.get({
    fileId: data.id,
    fields: 'id, webViewLink, webContentLink'
  });

  return {
    id: data.id,
    webViewLink: file.webViewLink,
    webContentLink: file.webContentLink,
  };
}