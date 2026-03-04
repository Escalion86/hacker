import * as FileSystem from 'expo-file-system';

const AVATAR_DIR = `${FileSystem.documentDirectory || ''}show-avatars/`;

function isRemoteHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return value.startsWith('http://') || value.startsWith('https://');
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function inferExtensionFromUrl(url) {
  const cleaned = String(url).split('?')[0].split('#')[0];
  const dotIndex = cleaned.lastIndexOf('.');
  if (dotIndex === -1) return '.jpg';
  const ext = cleaned.slice(dotIndex).toLowerCase();
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp') return ext;
  return '.jpg';
}

async function ensureAvatarDir() {
  const dirInfo = await FileSystem.getInfoAsync(AVATAR_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
  }
}

export async function cacheAvatarLocally(remoteUrl) {
  if (!isRemoteHttpUrl(remoteUrl)) return '';
  if (!FileSystem.documentDirectory) return '';

  try {
    await ensureAvatarDir();
    const ext = inferExtensionFromUrl(remoteUrl);
    const fileUri = `${AVATAR_DIR}avatar_${hashString(remoteUrl)}${ext}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    await FileSystem.downloadAsync(remoteUrl, fileUri);
    return fileUri;
  } catch {
    return '';
  }
}
