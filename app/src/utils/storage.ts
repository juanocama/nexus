import { Platform } from 'react-native';

const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_auth_user';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  const { default: SecureStore } = await import('expo-secure-store');
  return SecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb()) {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn('localStorage unavailable');
    }
  } else {
    const { default: SecureStore } = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb()) {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn('localStorage unavailable');
    }
  } else {
    const { default: SecureStore } = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
}

export { TOKEN_KEY, USER_KEY };
