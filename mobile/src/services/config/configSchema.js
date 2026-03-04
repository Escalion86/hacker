const SUPPORTED_SCHEMA_VERSION = 1;
const SUPPORTED_TEMPLATE_IDS = new Set(['escalion', 'fertVlad', 'fertvlad']);

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

export function validateShowConfigPayload(payload) {
  const root = asObject(payload);
  if (!root) {
    return { ok: false, error: 'Ответ сервера не является объектом' };
  }

  const candidate = asObject(root.config) || root;
  const schemaVersion = Number(candidate.schemaVersion);
  if (schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Неподдерживаемая версия схемы: ${String(candidate.schemaVersion ?? 'unknown')}`,
    };
  }

  const profile = asObject(candidate.profile);
  const template = asObject(candidate.template);
  const templateId =
    asNonEmptyString(candidate.templateId) ||
    asNonEmptyString(template?.id) ||
    asNonEmptyString(profile?.id);

  if (!templateId) {
    return { ok: false, error: 'В конфиге отсутствует template/profile id' };
  }

  if (!SUPPORTED_TEMPLATE_IDS.has(templateId)) {
    return { ok: false, error: `Шаблон "${templateId}" пока не поддерживается в приложении` };
  }

  const normalized = {
    schemaVersion,
    templateId,
    templateName: asNonEmptyString(candidate.templateName),
    profile: {
      id: asNonEmptyString(profile?.id) || templateId,
      displayName: asNonEmptyString(profile?.displayName) || '',
    },
    meta: {
      version: asNonEmptyString(candidate.version) || '1',
      updatedAt: asNonEmptyString(candidate.updatedAt) || '',
    },
    ui: {
      operatorName:
        asNonEmptyString(candidate?.payload?.operatorProfile?.fullName) ||
        asNonEmptyString(profile?.displayName) ||
        '',
      operatorAvatarUrl: asNonEmptyString(candidate?.payload?.operatorProfile?.avatarUrl) || '',
      templateTitle:
        asNonEmptyString(candidate?.payload?.templateMeta?.title) ||
        asNonEmptyString(candidate.templateName) ||
        '',
    },
    payload: candidate,
  };

  return { ok: true, value: normalized };
}

export function getSupportedSchemaVersion() {
  return SUPPORTED_SCHEMA_VERSION;
}
