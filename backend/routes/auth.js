const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// GET /auth/google
router.get('/google', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  const scopes = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/user.birthday.read',
    'https://www.googleapis.com/auth/user.gender.read',
    'profile',
    'email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  console.log("Generating Auth URL with Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Redirect URI being sent:", process.env.GOOGLE_REDIRECT_URI);
  console.log("Final Google Auth URL:", url);

  res.redirect(url);
});

// GET /auth/callback
router.get('/callback', async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    
    // Extract userId (google sub id) from id_token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    req.session.userId = payload.sub; // This is the unique google ID
    
    console.log("Logged in user ID:", req.session.userId);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard`);
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=auth_failed`);
  }
});

// GET /auth/status
router.get('/status', (req, res) => {
  res.json({ loggedIn: !!req.session.tokens });
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
