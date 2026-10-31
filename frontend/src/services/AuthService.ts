// AuthService interface & Local implementation
// Backed by Zustand state / local storage
// NOTE: In a future cloud-backed architecture, a RemoteAuthService implementing
// this interface would call POST /api/auth/login, /api/auth/otp, etc.

export interface UserSession {
  phoneNumber?: string;
  email?: string;
  name: string;
  isAuthenticated: boolean;
  isDemo: boolean;
}

export interface IAuthService {
  getCurrentSession(): Promise<UserSession>;
  loginWithPhone(phone: string, otp: string): Promise<UserSession>;
  loginWithEmail(email: string, pass: string): Promise<UserSession>;
  loginAsDemo(businessId: string): Promise<UserSession>;
  logout(): Promise<void>;
}

class LocalAuthService implements IAuthService {
  private STORAGE_KEY = 'arthsetu_session';

  async getCurrentSession(): Promise<UserSession> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return { name: 'Ramesh Patel', isAuthenticated: true, isDemo: true };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { name: 'Ramesh Patel', isAuthenticated: true, isDemo: true };
    }
  }

  async loginWithPhone(phone: string, _otp: string): Promise<UserSession> {
    // Simulated authentication for demo. Accepts any 6-digit OTP.
    const session: UserSession = {
      phoneNumber: phone,
      name: 'Business Owner',
      isAuthenticated: true,
      isDemo: true,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async loginWithEmail(email: string, _pass: string): Promise<UserSession> {
    const session: UserSession = {
      email,
      name: 'Business Owner',
      isAuthenticated: true,
      isDemo: true,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async loginAsDemo(_businessId: string): Promise<UserSession> {
    const session: UserSession = {
      name: 'Ramesh Patel (Demo)',
      isAuthenticated: true,
      isDemo: true,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const authService: IAuthService = new LocalAuthService();

