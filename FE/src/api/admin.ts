// src/api/admin.ts
import apiClient from './client';

export const getUsers = (params?: { role?: string; search?: string }) =>
  apiClient.get('/api/admin/users', { params });
export const createUser = (data: { fullName: string; email: string; password: string; role: string }) =>
  apiClient.post('/api/admin/users', data);
export const updateUser = (userId: string, data: { fullName?: string; email?: string; role?: string }) =>
  apiClient.put(`/api/admin/users/${userId}`, data);
export const deleteUser = (userId: string) =>
  apiClient.delete(`/api/admin/users/${userId}`);
