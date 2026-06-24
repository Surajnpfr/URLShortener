const User = require('../models/User');
const { getDbMode, isDatabaseReady } = require('../config/db');

class SyncUserError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SyncUserError';
    this.code = code;
    this.details = details;
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildProfileFromOidc(oidcUser) {
  const auth0Id = oidcUser?.sub;
  if (!auth0Id) {
    throw new SyncUserError('Auth0 session is missing subject (sub claim)', 'MISSING_SUB', {
      claims: Object.keys(oidcUser || {}),
    });
  }

  const email = normalizeEmail(oidcUser.email)
    || `${String(auth0Id).replace(/\|/g, '_')}@users.auth0`;
  const name = oidcUser.name || oidcUser.nickname || '';

  return { auth0Id, email, name };
}

function logSyncContext(phase, context) {
  console.info(`[auth/sync] ${phase}`, context);
}

function logSyncFailure(error, context) {
  console.error('[auth/sync] failed', {
    ...context,
    message: error.message,
    code: error.code,
    mongoCode: error.code === 11000 ? error.keyValue : undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
}

async function updateUserRecord(filter, updates) {
  const user = await User.findOneAndUpdate(
    filter,
    updates,
    { new: true },
  );

  if (!user) {
    throw new SyncUserError('User record could not be loaded after update', 'USER_NOT_FOUND', {
      filter,
    });
  }

  return user;
}

async function createOrLinkUser({ auth0Id, email, name }) {
  const existingByAuth0Id = await User.findOne({ auth0Id });
  if (existingByAuth0Id) {
    logSyncContext('found by auth0Id', { auth0Id, userId: existingByAuth0Id._id });
    return updateUserRecord(
      { auth0Id },
      { $set: { email, name } },
    );
  }

  const existingByEmail = await User.findOneByEmail(email);
  if (existingByEmail) {
    logSyncContext('linking legacy user by email', {
      auth0Id,
      email,
      userId: existingByEmail._id,
      previousAuth0Id: existingByEmail.auth0Id || null,
    });

    return updateUserRecord(
      { _id: existingByEmail._id },
      { $set: { auth0Id, email, name } },
    );
  }

  logSyncContext('creating user', { auth0Id, email });

  try {
    const created = await User.findOneAndUpdate(
      { auth0Id },
      {
        $set: { email, name },
        $setOnInsert: { plan: 'Free', createdAt: new Date() },
      },
      { upsert: true, new: true },
    );

    if (!created) {
      throw new SyncUserError('Upsert did not return a user document', 'UPSERT_EMPTY', { auth0Id });
    }

    return created;
  } catch (error) {
    if (error.code === 11000) {
      logSyncContext('duplicate key on upsert, recovering', {
        auth0Id,
        email,
        keyValue: error.keyValue,
      });

      const recovered = await User.findOne({ auth0Id }) || await User.findOneByEmail(email);
      if (recovered) {
        return updateUserRecord(
          { _id: recovered._id },
          { $set: { auth0Id, email, name } },
        );
      }
    }

    throw error;
  }
}

async function syncUserFromOidc(req) {
  const oidcUser = req.oidc?.user;
  const profile = buildProfileFromOidc(oidcUser);

  if (!isDatabaseReady()) {
    throw new SyncUserError(
      'Database is not ready',
      'DB_NOT_READY',
      { dbMode: getDbMode() },
    );
  }

  logSyncContext('start', {
    auth0Id: profile.auth0Id,
    email: profile.email,
    dbMode: getDbMode(),
    authenticated: Boolean(req.oidc?.isAuthenticated()),
  });

  const user = await createOrLinkUser(profile);
  req.user = user;

  logSyncContext('complete', {
    auth0Id: profile.auth0Id,
    userId: user._id,
    email: user.email,
  });

  return user;
}

function formatSyncErrorResponse(error) {
  if (error instanceof SyncUserError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error.code === 11000) {
    return {
      error: 'A user with this Auth0 id or email already exists',
      code: 'DUPLICATE_USER',
      details: { keyValue: error.keyValue },
    };
  }

  return {
    error: 'Failed to sync user account',
    code: 'SYNC_ERROR',
    details: { message: error.message },
  };
}

function requireAuth(req, res, next) {
  if (!req.oidc?.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return syncUserFromOidc(req)
    .then(() => next())
    .catch((error) => {
      logSyncFailure(error, {
        auth0Id: req.oidc?.user?.sub,
        email: req.oidc?.user?.email,
        dbMode: getDbMode(),
        dbReady: isDatabaseReady(),
        path: req.originalUrl,
      });

      const body = formatSyncErrorResponse(error);
      const status = error instanceof SyncUserError && error.code === 'DB_NOT_READY' ? 503 : 500;
      return res.status(status).json(body);
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
  SyncUserError,
};
