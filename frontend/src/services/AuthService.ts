// AuthService interface & Local implementation
// Backed by Zustand multi-user state and local storage

import { useArthSetuStore } from '../store/useArthSetuStore';
import { UserAccount } from './types';

export interface UserSession {
  userId?: string;
  phoneNumber?: string;
  email?: string;
  name: string;
  isAuthenticated: boolean;
  isDemo: boolean;
}

export interface IAuthService {
  getCurrentSession(): Promise<UserSession | null>;
  loginWithPhone(phone: string, otpOrPass: string): Promise<UserSession>;
  loginWithEmail(email: string, pass: string): Promise<UserSession>;
  loginAsDemo(businessIdOrUserId: string): Promise<UserSession>;
  logout(): Promise<void>;
}

class LocalAuthService implements IAuthService {
  async getCurrentSession(): Promise<UserSession | null> {
    const user = useArthSetuStore.getState().currentUser;
    if (!user) return null;
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone,
      isAuthenticated: true,
      isDemo: user.id.startsWith('usr_ramesh') || user.id.startsWith('usr_priya') || user.id.startsWith('usr_sunita'),
    };
  }

  async loginWithPhone(phone: string, otpOrPass: string): Promise<UserSession> {
    const res = useArthSetuStore.getState().login(phone, otpOrPass);
    if (!res.success) {
      throw new Error(res.error || 'Authentication failed');
    }
    const user = useArthSetuStore.getState().currentUser!;
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone,
      isAuthenticated: true,
      isDemo: false,
    };
  }

  async loginWithEmail(email: string, pass: string): Promise<UserSession> {
    const res = useArthSetuStore.getState().login(email, pass);
    if (!res.success) {
      throw new Error(res.error || 'Authentication failed');
    }
    const user = useArthSetuStore.getState().currentUser!;
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone,
      isAuthenticated: true,
      isDemo: false,
    };
  }

  async loginAsDemo(businessIdOrUserId: string): Promise<UserSession> {
    // If passed a userId, use directly, else map businessId
    let targetUserId = businessIdOrUserId;
    if (businessIdOrUserId.includes('lakshmi')) targetUserId = 'usr_ramesh';
    else if (businessIdOrUserId.includes('rangoli')) targetUserId = 'usr_priya';
    else if (businessIdOrUserId.includes('sunita')) targetUserId = 'usr_sunita';

    useArthSetuStore.getState().loginAsDemoUser(targetUserId);
    const user = useArthSetuStore.getState().currentUser!;
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone,
      isAuthenticated: true,
      isDemo: true,
    };
  }

  async logout(): Promise<void> {
    useArthSetuStore.getState().logout();
  }
}

export const authService: IAuthService = new LocalAuthService();
