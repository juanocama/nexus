export const CONFIG = {
  AUTH: {
    MICROSOFT_CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
    MICROSOFT_TENANT_ID: 'YOUR_TENANT_ID_HERE',
    SCOPES: ['openid', 'profile', 'email', 'User.Read'],
    AUTHORITY: 'https://login.microsoftonline.com/common',
    REDIRECT_URI: 'nexus://auth/callback',
    INSTITUTIONAL_DOMAIN: '@unisabana.edu.co',
    NOTE: 'Para autenticacion Microsoft, el administrador de dominio Unisabana debe registrar la app en Azure AD y proporcionar el CLIENT_ID',
  },
  API: {
    BASE_URL: __DEV__
      ? 'http://192.168.1.2:3000/api/v1'
      : 'https://api.nexus.unisabana.edu.co/api/v1',
    TIMEOUT: 15000,
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 100,
  },
};

export const validateInstitutionalEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith(CONFIG.AUTH.INSTITUTIONAL_DOMAIN);
};

export const getMicrosoftAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: CONFIG.AUTH.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: CONFIG.AUTH.REDIRECT_URI,
    scope: CONFIG.AUTH.SCOPES.join(' '),
    prompt: 'select_account',
  });
  return `${CONFIG.AUTH.AUTHORITY}/oauth2/v2.0/authorize?${params.toString()}`;
};
