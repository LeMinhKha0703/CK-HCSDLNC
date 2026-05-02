// src/api/auth.ts
import apiClient from './client';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { fullName: string; email: string; password: string; isTeacher: boolean; }
export interface LoginResponse { access_token: string; role: string; fullName: string; userId: string; }

export const login = (data: LoginPayload) =>
  apiClient.post<LoginResponse>('/api/auth/login', data);

export const register = (data: RegisterPayload) =>
  apiClient.post('/api/auth/register', data);
