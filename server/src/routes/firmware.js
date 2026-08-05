const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const DEFAULT_PARTS = [
  { file: 'bootloader.bin', offset: 4096 },
  { file: 'partitions.bin', offset: 32768 },
  { file: 'boot_app0.bin', offset: 57344 },
  { file: 'firmware.bin', offset: 65536 },
];

function isSafeVersionName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (!trimmed || trimmed !== name) return false;
  if (trimmed.includes('..')) return false;
  if (trimmed.includes('/') || trimmed.includes('\\')) return false;
  return true;
}

/**
 * Optional per-version meta.json in the firmware folder:
 * {
 *   "name": "FakeWiFi PRO (ESP32-C6) - Hacker 2.0 Stable",
 *   "label": "Hacker 2.0 Stable",
 *   "chipFamily": "ESP32-C6",
 *   "parts": [
 *     { "file": "bootloader.bin", "offset": 0 },
 *     { "file": "partitions.bin", "offset": 32768 },
 *     { "file": "boot_app0.bin", "offset": 57344 },
 *     { "file": "firmware.bin", "offset": 65536 }
 *   ]
 * }
 * Without meta.json the classic ESP32 layout is used (backward compatible).
 */
async function readFolderMeta(folderPath) {
  try {
    const raw = await fs.readFile(path.join(folderPath, 'meta.json'), 'utf8');
    const meta = JSON.parse(raw);
    if (meta && Array.isArray(meta.parts) && meta.parts.length) {
      const parts = meta.parts
        .filter(
          (p) =>
            p &&
            typeof p.file === 'string' &&
            p.file.length > 0 &&
            !p.file.includes('/') &&
            !p.file.includes('\\') &&
            !p.file.includes('..') &&
            typeof p.offset === 'number' &&
            p.offset >= 0,
        )
        .map((p) => ({ file: p.file, offset: p.offset }));
      if (parts.length) {
        return {
          name: typeof meta.name === 'string' ? meta.name : undefined,
          label: typeof meta.label === 'string' ? meta.label : undefined,
          chipFamily: typeof meta.chipFamily === 'string' ? meta.chipFamily : 'ESP32',
          parts,
        };
      }
    }
  } catch (err) {
    // no meta.json or invalid -> fall back to default layout
    return null;
  }
  return null;
}

async function readFirmwareVersions(firmwareRoot) {
  const entries = await fs.readdir(firmwareRoot, { withFileTypes: true });
  const versions = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !isSafeVersionName(entry.name)) {
      continue;
    }

    const folderPath = path.join(firmwareRoot, entry.name);
    const meta = await readFolderMeta(folderPath);
    const requiredParts = meta ? meta.parts : DEFAULT_PARTS;

    const hasAllParts = await Promise.all(
      requiredParts.map(async ({ file }) => {
        try {
          await fs.access(path.join(folderPath, file));
          return true;
        } catch {
          return false;
        }
      }),
    );

    if (hasAllParts.every(Boolean)) {
      versions.push({ name: entry.name, meta });
    }
  }

  versions.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return versions;
}

function buildManifest(version, meta) {
  const chipFamily = meta ? meta.chipFamily : 'ESP32';
  const parts = meta ? meta.parts : DEFAULT_PARTS;

  return {
    name: meta && meta.name ? meta.name : `FakeWiFi PRO (ESP32) - ${version}`,
    version,
    new_install_prompt_erase: false,
    new_install_improv_wait_time: 0,
    builds: [
      {
        chipFamily,
        parts: parts.map(({ file, offset }) => ({
          path: `/firmware/${version}/${file}`,
          offset,
        })),
      },
    ],
  };
}

function buildFirmwareRouter({ firmwareRoot }) {
  const router = express.Router();

  router.get('/firmware-manifests', async (req, res, next) => {
    try {
      const versions = await readFirmwareVersions(firmwareRoot);
      const defaultVersion = versions.some((v) => v.name === 'fakewifi-pro')
        ? 'fakewifi-pro'
        : (versions[0]?.name ?? null);

      return res.json({
        defaultVersion,
        versions: versions.map(({ name, meta }) => ({
          id: name,
          label: (meta && meta.label) || name,
          chipFamily: (meta && meta.chipFamily) || 'ESP32',
          manifestUrl: `/api/firmware-manifest/${encodeURIComponent(name)}`,
        })),
      });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/firmware-manifest/:version', async (req, res, next) => {
    try {
      const version = String(req.params.version || '').trim();
      if (!isSafeVersionName(version)) {
        return res.status(400).json({ error: 'invalid_version' });
      }

      const versions = await readFirmwareVersions(firmwareRoot);
      const found = versions.find((v) => v.name === version);
      if (!found) {
        return res.status(404).json({ error: 'firmware_not_found' });
      }

      return res.json(buildManifest(found.name, found.meta));
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { buildFirmwareRouter };
