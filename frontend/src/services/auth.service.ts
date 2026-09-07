import { api } from './api';
import { User } from '../types';

export const authService = {
  async register(data: any): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return api.post('/auth/register', data);
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return api.post('/auth/login', data);
  },

  async logout(refreshToken?: string): Promise<{ message: string }> {
    return api.post('/auth/logout', { refreshToken });
  },

  async getMe(): Promise<User> {
    return api.get('/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<{ message: string }> {
    return api.post('/auth/reset-password', data);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return api.post('/auth/change-password', data);
  },
};
