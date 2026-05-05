import { Platform } from 'react-native';

const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_auth_user';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

async function getSecureStore() {
  if (isWeb()) return null;
  try {
    const SecureStore = await import('expo-secure-store');
    if (SecureStore?.isAvailableAsync && await SecureStore.isAvailableAsync()) {
      return SecureStore;
    }
  } catch {
    // expo-secure-store not available (e.g. Expo Go)
  }
  return null;
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb()) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  }
  const ss = await getSecureStore();
  if (!ss) return null;
  try {
    return await ss.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb()) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      console.warn('localStorage unavailable');
    }
  } else {
    const ss = await getSecureStore();
    if (!ss) {
      console.warn('SecureStore not available, auth will not persist');
      return;
    }
    try {
      await ss.setItemAsync(key, value);
    } catch (e) {
      console.error('SecureStore setItem error:', e);
    }
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb()) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      console.warn('localStorage unavailable');
    }
  } else {
    const ss = await getSecureStore();
    if (!ss) return;
    try {
      await ss.deleteItemAsync(key);
    } catch {
      // ignore
    }
  }
}

export { TOKEN_KEY, USER_KEY };
