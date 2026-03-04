const express = require('express');
const { z } = require('zod');
const { normalizeCode, hashAccessCode } = require('../utils/hash');
const { resolveConfigByCodeHash } = require('../services/showConfigService');

function buildShowConfigRouter({ accessCodePepper }) {
  const router = express.Router();

  const querySchema = z.object({
    code: z.string().min(1).max(128),
  });

  router.get('/show-config', async (req, res, next) => {
    try {
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_code' });
      }

      const normalizedCode = normalizeCode(parsed.data.code);
      if (!normalizedCode) {
        return res.status(400).json({ error: 'invalid_code' });
      }

      const codeHash = hashAccessCode(normalizedCode, accessCodePepper);
      const result = await resolveConfigByCodeHash(codeHash);

      if (!result.ok) {
        if (result.reason === 'expired') {
          return res.status(410).json({ error: 'code_expired' });
        }
        return res.status(404).json({ error: 'code_not_found' });
      }

      return res.json(result.value);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { buildShowConfigRouter };
