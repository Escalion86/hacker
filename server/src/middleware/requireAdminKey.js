function requireAdminKey(expectedKey) {
  return function adminKeyMiddleware(req, res, next) {
    const incoming = String(req.header('x-admin-key') || '').trim();
    if (!incoming || incoming !== expectedKey) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    return next();
  };
}

module.exports = { requireAdminKey };
