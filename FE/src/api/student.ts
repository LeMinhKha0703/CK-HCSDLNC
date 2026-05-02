// src/api/student.ts
import apiClient from './client';

export const getMyGroups = () => apiClient.get('/api/student/groups');
export const getGroupDetail = (groupId: string) => apiClient.get(`/api/student/groups/${groupId}`);
export const getExamContent = (examId: string) => apiClient.get(`/api/student/exams/${examId}`);
export const submitExam = (examId: string, answers: { answers: { questionId: number; studentResponse: string }[] }) =>
  apiClient.post(`/api/student/exams/${examId}/submit`, answers);
export const getNotifications = () => apiClient.get('/api/student/notifications');
export const acceptInvitation = (notifId: string) =>
  apiClient.post(`/api/student/notifications/${notifId}/accept`);
