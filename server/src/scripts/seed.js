const env = require('../config/env');
const { connectDb } = require('../config/db');
const ShowConfig = require('../models/ShowConfig');
const AccessCode = require('../models/AccessCode');
const { normalizeCode, hashAccessCode, getCodeLast4 } = require('../utils/hash');

function resolveSeedTemplateByCode(code) {
  if (code === 'fertvlad' || code === 'fertVlad') {
    return {
      templateId: 'fertVlad',
      templateName: 'One Plus',
      profileId: 'fertVlad',
      displayName: 'Владимир Ферт',
      version: '2026-03-04.1',
      notes: 'Initial fertVlad config',
    };
  }

  return {
    templateId: 'escalion',
    templateName: 'Samsung OneUi 8',
    profileId: 'escalion',
    displayName: 'Алексей Белинский',
    version: '2026-03-04.1',
    notes: 'Initial escalion config',
  };
}

async function run() {
  const rawCode = process.argv[2] || 'escalion';
  const normalizedCode = normalizeCode(rawCode);
  const seedTemplate = resolveSeedTemplateByCode(normalizedCode);

  await connectDb(env.mongoUri);

  const config = await ShowConfig.findOneAndUpdate(
    { templateId: seedTemplate.templateId, version: seedTemplate.version },
    {
      $set: {
        templateName: seedTemplate.templateName,
        profile: {
          id: seedTemplate.profileId,
          displayName: seedTemplate.displayName,
        },
        payload: {
          operatorProfile: {
            fullName: seedTemplate.displayName,
            avatarUrl: '',
          },
          templateMeta: {
            title: seedTemplate.templateName,
          },
        },
      },
      $setOnInsert: {
        schemaVersion: 1,
        version: seedTemplate.version,
        templateId: seedTemplate.templateId,
        isActive: true,
        notes: seedTemplate.notes,
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
