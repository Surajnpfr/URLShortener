const swaggerJsdoc = require('swagger-jsdoc');

const apiBaseUrl = process.env.BASE_URL || 'http://localhost:5000';
const dualAuth = [{ bearerAuth: [] }, { cookieAuth: [] }];
const sessionOnly = [{ cookieAuth: [] }];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Linkly URL Shortener API',
      version: '1.0.0',
      description: [
        'Personal URL shortener API with Auth0 session authentication and per-user API keys.',
        '',
        '**Dashboard auth:** Session cookie via `GET /login` in your browser.',
        '**Bot/script auth:** `Authorization: Bearer lk_live_...` API key from the dashboard API tab.',
        'Generate keys with `POST /api/auth/api-key` (session only). Keys are shown once.',
      ].join('\n'),
    },
    servers: [
      { url: apiBaseUrl, description: 'API server' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'appSession',
          description: 'Auth0 session cookie set after login via GET /login',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API key',
          description: 'Per-user API key (lk_live_...) from POST /api/auth/api-key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            fullName: { type: 'string' },
            plan: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UrlItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            _id: { type: 'string' },
            originalUrl: { type: 'string', format: 'uri' },
            shortCode: { type: 'string' },
            shortUrl: { type: 'string', format: 'uri' },
            clicks: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            redirectType: { type: 'integer' },
          },
        },
        CreateUrlRequest: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://example.com' },
            originalUrl: { type: 'string', example: 'https://example.com', description: 'Alias for url' },
            customAlias: { type: 'string', example: 'my-link' },
            redirectType: { type: 'integer', example: 302 },
            shortCodeLength: { type: 'integer', example: 6 },
          },
        },
        ApiKeyMetadata: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            prefix: { type: 'string', example: 'lk_live_ab12cd34' },
            createdAt: { type: 'string', format: 'date-time' },
            lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        AnalyticsSummary: {
          type: 'object',
          properties: {
            totalClicks: { type: 'integer' },
            uniqueVisitors: { type: 'integer' },
            linkCount: { type: 'integer' },
            totalUrls: { type: 'integer' },
            clicksByDay: { type: 'array', items: { type: 'object' } },
            clicksByDate: { type: 'array', items: { type: 'object' } },
            topLinks: { type: 'array', items: { type: 'object' } },
            topUrls: { type: 'array', items: { type: 'object' } },
            recentClicks: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    paths: {
      '/api/auth/session': {
        get: {
          tags: ['Auth'],
          summary: 'Check session status',
          responses: {
            200: {
              description: 'Session status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { authenticated: { type: 'boolean' } },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/api-key': {
        get: {
          tags: ['Auth'],
          summary: 'Get current API key metadata (session only)',
          security: sessionOnly,
          responses: {
            200: {
              description: 'API key status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      hasKey: { type: 'boolean' },
                      apiKey: { $ref: '#/components/schemas/ApiKeyMetadata', nullable: true },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Auth'],
          summary: 'Generate API key (replaces existing; session only)',
          security: sessionOnly,
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string', example: 'Telegram Bot' } },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'API key created — plain key shown once',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      key: { type: 'string' },
                      apiKey: { $ref: '#/components/schemas/ApiKeyMetadata' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
        delete: {
          tags: ['Auth'],
          summary: 'Revoke current API key (session only)',
          security: sessionOnly,
          responses: {
            200: { description: 'Revoked' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: dualAuth,
          responses: {
            200: {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { user: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        patch: {
          tags: ['Auth'],
          summary: 'Update display name',
          security: sessionOnly,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: { name: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Updated profile' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/urls': {
        get: {
          tags: ['URLs'],
          summary: 'List current user URLs',
          security: dualAuth,
          responses: {
            200: {
              description: 'Array of URL items',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/UrlItem' } },
                },
              },
            },
            401: { description: 'Unauthorized' },
            500: { description: 'Server error' },
          },
        },
        post: {
          tags: ['URLs'],
          summary: 'Create a shortened URL',
          security: dualAuth,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUrlRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Created URL',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/UrlItem' } } },
            },
            400: { description: 'Invalid URL or alias' },
            401: { description: 'Unauthorized' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/urls/{id}': {
        get: {
          tags: ['URLs'],
          summary: 'Get URL details by ID',
          security: dualAuth,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'URL item', content: { 'application/json': { schema: { $ref: '#/components/schemas/UrlItem' } } } },
            403: { description: 'Forbidden' },
            404: { description: 'Not found' },
          },
        },
        delete: {
          tags: ['URLs'],
          summary: 'Delete a URL',
          security: dualAuth,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Deleted' },
            403: { description: 'Forbidden' },
            404: { description: 'Not found' },
          },
        },
      },
      '/api/shorten': {
        post: {
          tags: ['URLs'],
          summary: 'Create shortened URL (alias of POST /api/urls)',
          security: dualAuth,
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUrlRequest' } } },
          },
          responses: { 201: { description: 'Created URL' } },
        },
      },
      '/api/analytics/summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Dashboard analytics summary',
          security: dualAuth,
          parameters: [
            { name: 'range', in: 'query', schema: { type: 'string', enum: ['7d', '30d', '90d', 'all'], default: '7d' } },
          ],
          responses: {
            200: {
              description: 'Analytics summary',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalyticsSummary' } } },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/analytics/links/{urlId}': {
        get: {
          tags: ['Analytics'],
          summary: 'Per-link analytics',
          security: dualAuth,
          parameters: [
            { name: 'urlId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'range', in: 'query', schema: { type: 'string', default: '30d' } },
          ],
          responses: {
            200: { description: 'Link analytics' },
            404: { description: 'Link not found' },
          },
        },
      },
      '/go/{shortCode}': {
        get: {
          tags: ['Redirect'],
          summary: 'Public redirect by short code',
          parameters: [{ name: 'shortCode', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            302: { description: 'Redirect to original URL' },
            404: { description: 'Link not found' },
          },
        },
      },
      '/api/resolve/{shortCode}': {
        get: {
          tags: ['Redirect'],
          summary: 'Resolve short code to original URL (JSON)',
          parameters: [{ name: 'shortCode', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Resolved URL',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      originalUrl: { type: 'string' },
                      redirectType: { type: 'integer' },
                    },
                  },
                },
              },
            },
            404: { description: 'Not found' },
          },
        },
      },
      '/api/status': {
        get: {
          tags: ['System'],
          summary: 'API and database status',
          responses: {
            200: {
              description: 'Status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      dbMode: { type: 'string' },
                      dbReady: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

function getSwaggerSpec() {
  return swaggerJsdoc(options);
}

module.exports = {
  getSwaggerSpec,
};
