const apiBase = `${window.location.origin}/api`;
document.getElementById('apiBase').textContent = apiBase;

function log(message, ok = true) {
  const node = document.getElementById('log');
  node.className = `log ${ok ? 'ok' : 'err'}`;
  node.textContent =
    typeof message === 'string' ? message : JSON.stringify(message, null, 2);
}

function getAdminKey() {
  return document.getElementById('adminKey').value.trim();
}

function ensureAdminKeyOrWarn() {
  const key = getAdminKey();
  if (key) return true;
  const message =
    'Введите Admin API Key в верхнем поле перед выполнением действия';
  log(message, false);
  window.alert(message);
  return false;
}

function normalizeCode(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function buildTemplateTitle(templateId) {
  const key = String(templateId || '')
    .trim()
    .toLowerCase();
  if (key === 'oneplus' || key === 'one_plus') return 'One Plus';
  if (key === 'huawei' || key === 'huaweiemui' || key === 'emui') {
    return 'Huawei EMUI';
  }
  return 'Samsung OneUi 8';
}

function buildVersion() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${y}-${m}-${d}.${hh}${mm}${ss}${ms}`;
}

async function api(path, options = {}, withAdmin = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (withAdmin) {
    const key = getAdminKey();
    if (!key) throw new Error('Введите Admin API Key');
    headers['x-admin-key'] = key;
  }
  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

const ui = {
  opUserSelect: document.getElementById('opUserSelect'),
  opName: document.getElementById('opName'),
  opAvatar: document.getElementById('opAvatar'),
  opTemplateTitle: document.getElementById('opTemplateTitle'),
  btnUpdateProfile: document.getElementById('btnUpdateProfile'),
  btnCreateConfig: document.getElementById('btnCreateConfig'),
  btnLoadCodes: document.getElementById('btnLoadCodes'),
  codesList: document.getElementById('codesList'),
};

let accessCodeItems = [];
let selectedAccessCodeId = '';
let profileBaseline = null;

function getProfileDraft() {
  return {
    fullName: ui.opName.value.trim(),
    avatarUrl: ui.opAvatar.value.trim(),
    templateTitle: ui.opTemplateTitle.value.trim(),
  };
}

function syncUpdateProfileButton() {
  if (!selectedAccessCodeId || !profileBaseline) {
    ui.btnUpdateProfile.disabled = true;
    return;
  }
  const draft = getProfileDraft();
  const changed =
    draft.fullName !== profileBaseline.fullName ||
    draft.avatarUrl !== profileBaseline.avatarUrl ||
    draft.templateTitle !== profileBaseline.templateTitle;
  ui.btnUpdateProfile.disabled = !changed;
}

function getProfileLabel(item) {
  const name = item?.config?.profileDisplayName || item?.config?.profileId || '';
  const last4 = item?.codeLast4 || '----';
  return `${name || 'Без имени'} (..${last4})`;
}

function fillProfileFormByItem(item) {
  selectedAccessCodeId = String(item?.id || '');
  const fullName = item?.config?.profileDisplayName || '';
  const avatarUrl = item?.config?.avatarUrl || '';
  const templateTitle =
    item?.config?.templateName || buildTemplateTitle(item?.config?.templateId || '');
  ui.opName.value = fullName;
  ui.opAvatar.value = avatarUrl;
  ui.opTemplateTitle.value = templateTitle;
  profileBaseline = { fullName, avatarUrl, templateTitle };
  syncUpdateProfileButton();
}

async function loadCodes() {
  const data = await api('/admin/access-codes', {}, true);
  accessCodeItems = Array.isArray(data.items) ? data.items : [];

  ui.codesList.innerHTML = '';
  if (!accessCodeItems.length) {
    ui.codesList.innerHTML = '<div class="code-item">Нет записей</div>';
  } else {
    accessCodeItems.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'code-item';
      div.textContent =
        `${getProfileLabel(item)} | status=${item.status} | ` +
        `template=${item.config?.templateId || '-'} | version=${item.config?.version || '-'}`;
      ui.codesList.appendChild(div);
    });
  }

  ui.opUserSelect.innerHTML = '';
  if (!accessCodeItems.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Пользователи не найдены';
    ui.opUserSelect.appendChild(option);
    selectedAccessCodeId = '';
    profileBaseline = null;
    syncUpdateProfileButton();
    return accessCodeItems;
  }

  accessCodeItems.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = String(item.id || '');
    option.textContent = getProfileLabel(item);
    if (index === 0) option.selected = true;
    ui.opUserSelect.appendChild(option);
  });

  fillProfileFormByItem(accessCodeItems[0]);
  return accessCodeItems;
}

document.getElementById('btnHealth').addEventListener('click', async () => {
  if (!ensureAdminKeyOrWarn()) return;
  try {
    const data = await api('/health');
    log(data, true);
  } catch (error) {
    log(error.message, false);
  }
});

ui.opUserSelect.addEventListener('change', () => {
  const selectedId = ui.opUserSelect.value;
  const item = accessCodeItems.find(
    (entry) => String(entry.id) === String(selectedId),
  );
  if (!item) return;
  fillProfileFormByItem(item);
});

ui.opName.addEventListener('input', syncUpdateProfileButton);
ui.opAvatar.addEventListener('input', syncUpdateProfileButton);
ui.opTemplateTitle.addEventListener('input', syncUpdateProfileButton);

ui.btnUpdateProfile.addEventListener('click', async () => {
  if (!ensureAdminKeyOrWarn()) return;
  try {
    if (!selectedAccessCodeId) throw new Error('Сначала выберите пользователя');
    const payload = {
      accessCodeId: selectedAccessCodeId,
      fullName: ui.opName.value.trim(),
      avatarUrl: ui.opAvatar.value.trim(),
      templateTitle: ui.opTemplateTitle.value.trim(),
    };
    await api(
      '/admin/operator-profile',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true,
    );
    profileBaseline = getProfileDraft();
    syncUpdateProfileButton();
    await loadCodes();
    log('Профиль обновлен', true);
  } catch (error) {
    log(error.message, false);
  }
});

ui.btnCreateConfig.addEventListener('click', async () => {
  if (!ensureAdminKeyOrWarn()) return;
  try {
    ui.btnCreateConfig.disabled = true;
    const code = normalizeCode(document.getElementById('cfgCode').value.trim());
    const templateId = document.getElementById('cfgTemplateId').value.trim();
    const fullName = document.getElementById('cfgFullName').value.trim();
    const avatarUrl = document.getElementById('cfgAvatar').value.trim();
    const templateTitle = buildTemplateTitle(templateId);

    if (!code) throw new Error('Введите code');
    if (!fullName) throw new Error('Введите имя пользователя');

    const payload = {
      schemaVersion: 1,
      version: buildVersion(),
      templateId,
      templateName: templateTitle,
      profile: {
        id: code,
        displayName: fullName,
      },
      payload: {
        operatorProfile: {
          fullName,
          avatarUrl,
        },
        templateMeta: {
          title: templateTitle,
        },
      },
      isActive: true,
    };
    const data = await api(
      '/admin/configs',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true,
    );

    let codeResult = null;
    try {
      codeResult = await api(
        '/admin/access-codes',
        {
          method: 'POST',
          body: JSON.stringify({
            code,
            configId: data.id,
          }),
        },
        true,
      );
    } catch (createCodeError) {
      if (String(createCodeError.message || '') !== 'code_already_exists') {
        throw createCodeError;
      }
      codeResult = await api(
        '/admin/access-codes/bind',
        {
          method: 'POST',
          body: JSON.stringify({
            code,
            configId: data.id,
          }),
        },
        true,
      );
    }

    await loadCodes();
    log(
      {
        configCreated: data,
        codeBound: codeResult,
        code,
      },
      true,
    );
  } catch (error) {
    log(error.message, false);
  } finally {
    ui.btnCreateConfig.disabled = false;
  }
});

ui.btnLoadCodes.addEventListener('click', async () => {
  if (!ensureAdminKeyOrWarn()) return;
  try {
    await loadCodes();
    log('Список кодов обновлен', true);
  } catch (error) {
    log(error.message, false);
  }
});
