const { SyncUserError } = require('./auth');

function notFoundHandler(req, res) {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyncUserError) {
    const status = err.code === 'DB_NOT_READY' ? 503 : 500;
    return res.status(status).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy blocked this request',
      code: 'CORS_NOT_ALLOWED',
      details: {
        origin: req.get('origin') || null,
      },
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { message: err.message },
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate record',
      code: 'DUPLICATE_KEY',
      details: { keyValue: err.keyValue },
    });
  }

  console.error('Uncaught Global Exception:', err.stack || err);
  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
