const express = require('express');
const { z } = require('zod');
const ShowConfig = require('../models/ShowConfig');
const AccessCode = require('../models/AccessCode');
const { normalizeCode, hashAccessCode, getCodeLast4 } = require('../utils/hash');

function buildAdminRouter({ accessCodePepper }) {
  const router = express.Router();

  const createConfigSchema = z.object({
    schemaVersion: z.number().int().min(1).default(1),
    version: z.string().min(1).max(64),
    templateId: z.string().min(1).max(64),
    profile: z.object({
      id: z.string().min(1).max(64),
      displayName: z.string().max(128).optional().default(''),
    }),
    payload: z.record(z.string(), z.any()).default({}),
    isActive: z.boolean().optional().default(true),
    notes: z.string().max(1000).optional().default(''),
  });

  const createCodeSchema = z.object({
    code: z.string().min(1).max(128),
    configId: z.string().min(1),
    validUntil: z.string().datetime().optional(),
    notes: z.string().max(1000).optional().default(''),
  });

  const bindCodeSchema = z.object({
    code: z.string().min(1).max(128),
    configId: z.string().min(1),
  });

  router.get('/admin/access-codes', async (req, res, next) => {
    try {
      const list = await AccessCode.find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .populate('configId', 'version templateId profile');

      return res.json({
        items: list.map((item) => ({
          id: item._id,
          codeLast4: item.codeLast4,
          status: item.status,
          validUntil: item.validUntil,
          config: item.configId
            ? {
                id: item.configId._id,
                version: item.configId.version,
                templateId: item.configId.templateId,
                profileId: item.configId.profile?.id || '',
              }
            : null,
          createdAt: item.createdAt,
        })),
      });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/configs', async (req, res, next) => {
    try {
      const parsed = createConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues });
      }

      const created = await ShowConfig.create(parsed.data);
      return res.status(201).json({ id: created._id });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: 'config_version_conflict' });
      }
      return next(error);
    }
  });

  router.post('/admin/access-codes', async (req, res, next) => {
    try {
      const parsed = createCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues });
      }

      const normalizedCode = normalizeCode(parsed.data.code);
      const codeHash = hashAccessCode(normalizedCode, accessCodePepper);

      const config = await ShowConfig.findById(parsed.data.configId);
      if (!config) {
        return res.status(404).json({ error: 'config_not_found' });
      }

      const created = await AccessCode.create({
        codeHash,
        codeLast4: getCodeLast4(normalizedCode),
        configId: config._id,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        notes: parsed.data.notes || '',
      });

      return res.status(201).json({
        id: created._id,
        codeLast4: created.codeLast4,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: 'code_already_exists' });
      }
      return next(error);
    }
  });

  router.post('/admin/access-codes/bind', async (req, res, next) => {
    try {
      const parsed = bindCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues });
      }

      const normalizedCode = normalizeCode(parsed.data.code);
      const codeHash = hashAccessCode(normalizedCode, accessCodePepper);

      const config = await ShowConfig.findById(parsed.data.configId);
      if (!config) {
        return res.status(404).json({ error: 'config_not_found' });
      }

      const updated = await AccessCode.findOneAndUpdate(
        { codeHash },
        { $set: { configId: config._id, status: 'active' } },
        { new: true },
      );

      if (!updated) {
        return res.status(404).json({ error: 'code_not_found' });
      }

      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/admin/access-codes/revoke', async (req, res, next) => {
    try {
      const code = normalizeCode(req.body?.code);
      if (!code) {
        return res.status(400).json({ error: 'invalid_code' });
      }
      const codeHash = hashAccessCode(code, accessCodePepper);
      const updated = await AccessCode.findOneAndUpdate(
        { codeHash },
        { $set: { status: 'revoked' } },
        { new: true },
      );
      if (!updated) {
        return res.status(404).json({ error: 'code_not_found' });
      }
      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { buildAdminRouter };
