import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';

class TokenManager {
  /**
   * Store tokens with "Remember Me" preference
   * @param accessToken - Access token from API
   * @param refreshToken - Refresh token from API
   * @param rememberMe - If true, tokens persist across browser sessions (7 days). If false, tokens are session-only.
   */
  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    const cookieOptions: Cookies.CookieAttributes = {
      path: '/',
      ...(rememberMe ? { expires: 7 } : {})
    };

    Cookies.set(ACCESS_TOKEN_KEY, accessToken, cookieOptions);
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, cookieOptions);
    Cookies.set(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false', cookieOptions);

  }

  /**
   * Get access token from cookies
   */
  getAccessToken(): string | null {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  }

  /**
   * Get refresh token from cookies
   */
  getRefreshToken(): string | null {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Check if "Remember Me" was enabled
   */
  isRememberMeEnabled(): boolean {
    return Cookies.get(REMEMBER_ME_KEY) === 'true';
  }

  /**
   * Clear all tokens and remember me preference
   */
  clearTokens(): void {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(REMEMBER_ME_KEY);
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
