const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';
const SAVED_EMAIL_KEY = 'saved_email';
const SAVED_PASSWORD_KEY = 'saved_password';
const CREDENTIALS_SAVED_KEY = 'credentials_saved';

class TokenManager {
  /**
   * Store tokens with "Remember Me" preference
   * @param accessToken - Access token from API
   * @param refreshToken - Refresh token from API
   * @param rememberMe - If true, also saves login credentials for auto-fill
   */
  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    if (typeof window === 'undefined') return;

    // Always store tokens in localStorage for cross-tab synchronization
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
  }

  /**
   * Save login credentials for auto-fill (when Remember Me is checked)
   * @param email - User's email
   * @param password - User's password
   */
  saveCredentials(email: string, password: string): void {
    if (typeof window === 'undefined') return;

    // Encode credentials (basic encoding, not encryption)
    // Note: For production, consider using proper encryption
    const encodedEmail = btoa(email);
    const encodedPassword = btoa(password);

    localStorage.setItem(SAVED_EMAIL_KEY, encodedEmail);
    localStorage.setItem(SAVED_PASSWORD_KEY, encodedPassword);
    localStorage.setItem(CREDENTIALS_SAVED_KEY, 'true');
  }

  /**
   * Get saved credentials for auto-fill
   * @returns Object with email and password, or null if not saved
   */
  getSavedCredentials(): { email: string; password: string } | null {
    if (typeof window === 'undefined') return null;

    const credentialsSaved = localStorage.getItem(CREDENTIALS_SAVED_KEY) === 'true';
    if (!credentialsSaved) return null;

    const encodedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
    const encodedPassword = localStorage.getItem(SAVED_PASSWORD_KEY);

    if (!encodedEmail || !encodedPassword) return null;

    try {
      // Decode credentials
      const email = atob(encodedEmail);
      const password = atob(encodedPassword);
      return { email, password };
    } catch (error) {
      console.error('Error decoding saved credentials:', error);
      return null;
    }
  }

  /**
   * Clear saved credentials
   */
  clearCredentials(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(SAVED_EMAIL_KEY);
    localStorage.removeItem(SAVED_PASSWORD_KEY);
    localStorage.removeItem(CREDENTIALS_SAVED_KEY);
  }

  /**
   * Check if credentials are saved
   */
  hasCredentialsSaved(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CREDENTIALS_SAVED_KEY) === 'true';
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if "Remember Me" was enabled
   */
  isRememberMeEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  /**
   * Clear all tokens and remember me preference
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }

  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  decodeToken(token: string): { exp?: number;[key: string]: unknown } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as { exp?: number;[key: string]: unknown };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token expires in next 5 minutes
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return currentTime >= (expirationTime - bufferTime);
  }

  getTokenExpiry(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded?.exp ? decoded.exp * 1000 : null;
  }
}

export const tokenManager = new TokenManager();
