const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const REQUIRED_PARTS = [
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

async function readFirmwareVersions(firmwareRoot) {
  const entries = await fs.readdir(firmwareRoot, { withFileTypes: true });
  const versions = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !isSafeVersionName(entry.name)) {
      continue;
    }

    const folderPath = path.join(firmwareRoot, entry.name);
    const hasAllParts = await Promise.all(
      REQUIRED_PARTS.map(async ({ file }) => {
        try {
          await fs.access(path.join(folderPath, file));
          return true;
        } catch {
          return false;
        }
      }),
    );

    if (hasAllParts.every(Boolean)) {
      versions.push(entry.name);
    }
  }

  versions.sort((a, b) => a.localeCompare(b, 'en'));
  return versions;
}

function buildManifest(version) {
  return {
    name: `FakeWiFi PRO (ESP32) - ${version}`,
    version,
    new_install_prompt_erase: false,
    new_install_improv_wait_time: 0,
    builds: [
      {
        chipFamily: 'ESP32',
        parts: REQUIRED_PARTS.map(({ file, offset }) => ({
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
      const defaultVersion = versions.includes('fakewifi-pro')
        ? 'fakewifi-pro'
        : (versions[0] ?? null);

      return res.json({
        defaultVersion,
        versions: versions.map((version) => ({
          id: version,
          label: version,
          manifestUrl: `/api/firmware-manifest/${encodeURIComponent(version)}`,
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
      if (!versions.includes(version)) {
        return res.status(404).json({ error: 'firmware_not_found' });
      }

      return res.json(buildManifest(version));
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { buildFirmwareRouter };
