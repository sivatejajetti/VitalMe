/**
 * Authentication Middleware
 * Checks if a user is logged in via session
 */
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.tokens && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized: Please log in via Google" });
};

module.exports = authMiddleware;
