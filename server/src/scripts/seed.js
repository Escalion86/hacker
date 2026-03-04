const env = require('../config/env');
const { connectDb } = require('../config/db');
const ShowConfig = require('../models/ShowConfig');
const AccessCode = require('../models/AccessCode');
const { normalizeCode, hashAccessCode, getCodeLast4 } = require('../utils/hash');

async function run() {
  const rawCode = process.argv[2] || 'escalion';
  const normalizedCode = normalizeCode(rawCode);

  await connectDb(env.mongoUri);

  const config = await ShowConfig.findOneAndUpdate(
    { templateId: 'escalion', version: '2026-03-04.1' },
    {
      $set: {
        templateName: 'Samsung OneUi 8',
        profile: {
          id: 'escalion',
          displayName: 'Алексей Белинский',
        },
        payload: {
          operatorProfile: {
            fullName: 'Алексей Белинский',
            avatarUrl: '',
          },
          templateMeta: {
            title: 'Samsung OneUi 8',
          },
        },
      },
      $setOnInsert: {
        schemaVersion: 1,
        version: '2026-03-04.1',
        templateId: 'escalion',
        isActive: true,
        notes: 'Initial escalion config',
      },
    },
    { upsert: true, new: true },
  );

  const codeHash = hashAccessCode(normalizedCode, env.accessCodePepper);
  const code = await AccessCode.findOneAndUpdate(
    { codeHash },
    {
      $set: {
        codeLast4: getCodeLast4(normalizedCode),
        status: 'active',
        configId: config._id,
      },
    },
    { upsert: true, new: true },
  );

  // eslint-disable-next-line no-console
  console.log('[seed] done', {
    code: normalizedCode,
    codeLast4: code.codeLast4,
    configId: String(config._id),
  });
  process.exit(0);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[seed] failed', error);
  process.exit(1);
});
