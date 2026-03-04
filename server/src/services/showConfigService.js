const AccessCode = require('../models/AccessCode');

async function resolveConfigByCodeHash(codeHash) {
  const accessCode = await AccessCode.findOne({
    codeHash,
    status: 'active',
  }).populate('configId');

  if (!accessCode) {
    return { ok: false, reason: 'not_found' };
  }

  if (accessCode.validUntil && accessCode.validUntil.getTime() < Date.now()) {
    return { ok: false, reason: 'expired' };
  }

  const config = accessCode.configId;
  if (!config || !config.isActive) {
    return { ok: false, reason: 'config_inactive' };
  }

  return {
    ok: true,
    value: {
      schemaVersion: config.schemaVersion,
      version: config.version,
      updatedAt: config.updatedAt.toISOString(),
      profile: {
        id: config.profile.id,
        displayName: config.profile.displayName || '',
      },
      templateId: config.templateId,
      templateName: config.templateName || '',
      payload: config.payload || {},
    },
  };
}

module.exports = { resolveConfigByCodeHash };
