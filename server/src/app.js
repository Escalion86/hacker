const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { buildShowConfigRouter } = require('./routes/showConfig');
const { buildAdminRouter } = require('./routes/admin');
const healthRouter = require('./routes/health');
const { requireAdminKey } = require('./middleware/requireAdminKey');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp(env) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((x) => x.trim()),
      credentials: false,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('combined'));

  const publicLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too_many_requests' },
  });

  app.use('/api', publicLimiter);
  app.use('/api', healthRouter);
  app.use('/api', buildShowConfigRouter({ accessCodePepper: env.accessCodePepper }));
  app.use('/api', requireAdminKey(env.adminApiKey), buildAdminRouter({ accessCodePepper: env.accessCodePepper }));
  app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

  app.use('/flash', (req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://unpkg.com",
    );
    next();
  });
  app.use('/flash', express.static(path.join(__dirname, '../public/flash')));
  app.use('/firmware', express.static(path.join(__dirname, '../public/firmware')));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
