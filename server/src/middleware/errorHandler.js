function notFoundHandler(req, res) {
  res.status(404).json({ error: 'not_found' });
}

function errorHandler(err, req, res, next) {
  const status = Number(err.status || 500);
  const message = err.message || 'internal_error';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[server_error]', {
      path: req.path,
      method: req.method,
      message,
    });
  }

  res.status(status).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
