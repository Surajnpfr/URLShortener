const User = require('../models/User');

async function loadUserFromSession(req) {
  const userId = req.session?.userId;
  if (!userId) return null;

  return User.findById(userId);
}

async function requireAuth(req, res, next) {
  try {
    const user = await loadUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Failed to load user session:', error);
    return res.status(500).json({ error: 'Failed to load user session' });
  }
}

function formatUserResponse(user) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    fullName: user.name,
    plan: user.plan,
    createdAt: user.createdAt,
  };
}

module.exports = {
  requireAuth,
  formatUserResponse,
  loadUserFromSession,
};
