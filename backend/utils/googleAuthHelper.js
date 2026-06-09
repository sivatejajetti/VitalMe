const { google } = require('googleapis');

/**
 * Retrieves a valid, unexpired Google access token from the session credentials.
 * Automatically handles token refreshing if a refresh token is present, and saves
 * the refreshed token back to the session store.
 * 
 * @param {object} req - Express request object
 * @returns {Promise<string>} Valid Google access token
 */
async function getValidAccessToken(req) {
  if (!req.session || !req.session.tokens) {
    throw new Error("Unauthorized: No Google OAuth session found");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(req.session.tokens);

  // Register token refresh event to save back to session
  oauth2Client.on('tokens', (newTokens) => {
    console.log("googleAuthHelper: Access token refreshed automatically.");
    req.session.tokens = { ...req.session.tokens, ...newTokens };
  });

  // This will check if the current token is expired, and if so, refresh it automatically.
  const response = await oauth2Client.getAccessToken();
  
  // Manually save session changes to ensure they are written to the database (Supabase)
  if (req.session.save) {
    await new Promise((resolve) => req.session.save(resolve));
  }

  return response.token;
}

module.exports = {
  getValidAccessToken
};
