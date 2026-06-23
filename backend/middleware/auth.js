const User = require('../models/User');

async function syncUserFromOidc(req) {
  const oidcUser = req.oidc?.user;

  if (!oidcUser?.sub) {
    throw new Error('Missing Auth0 subject');
  }

  const auth0Id = oidcUser.sub;
  const email = oidcUser.email || `${auth0Id}@users.auth0`;
  const name = oidcUser.name || oidcUser.nickname || '';

  const user = await User.findOneAndUpdate(
    { auth0Id },
    {
      $set: { email, name },
      $setOnInsert: { plan: 'Free', createdAt: new Date() },
    },
    { upsert: true, new: true },
  );

  req.user = user;
}

function requireAuth(req, res, next) {
  if (!req.oidc?.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return syncUserFromOidc(req)
    .then(() => next())
    .catch((error) => {
      console.error('Failed to sync user:', error);
      return res.status(500).json({ error: 'Failed to sync user account' });
    });
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
  syncUserFromOidc,
};
