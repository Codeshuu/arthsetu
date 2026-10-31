import api, { ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
  created_at?: string;
}

export interface LoginRequest {
  username: string; // or email
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Standard OAuth2 form or JSON
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);

    try {
      const res = await api.post<AuthResponse>('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      }
      return res.data;
    } catch {
      // Fallback for json login
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      const data = res.data.data || res.data;
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      return data as AuthResponse;
    }
  },

  async register(data: RegisterRequest): Promise<ApiResponse<{ user: User }>> {
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data || (res.data as any);
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('arthsetu_session');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
