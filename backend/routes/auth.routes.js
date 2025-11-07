import express from "express";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Démarrer le consentement Google pour obtenir un refresh_token (one-time)
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "Missing Google OAuth env vars: CLIENT_ID/SECRET/REDIRECT_URI" });
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  res.redirect(authUrl);
});

// Callback pour échanger le code contre des tokens (incl. refresh_token)
router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    const { tokens } = await oauth2Client.getToken(String(code));
    // Affiche les tokens pour que vous puissiez récupérer le refresh_token
    // Ensuite, mettez-le dans votre .env: GOOGLE_OAUTH_REFRESH_TOKEN
    res.json({
      message: "Copy refresh_token to env and restart server",
      tokens,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;