// src/api/teacher.ts
import apiClient from './client';

export const getDashboard = () => apiClient.get('/api/teacher/dashboard');
export const getGroups = () => apiClient.get('/api/teacher/groups');
export const createGroup = (data: { groupName: string; studentEmails?: string[] }) =>
  apiClient.post('/api/teacher/groups', data);
export const getGroupDetail = (groupId: string) => apiClient.get(`/api/teacher/groups/${groupId}`);
export const inviteStudents = (groupId: string, studentEmails: string[]) =>
  apiClient.post(`/api/teacher/groups/${groupId}/invite`, { studentEmails });
export const getExams = () => apiClient.get('/api/teacher/exams');
export const createExam = (data: unknown) => apiClient.post('/api/teacher/exams', data);
export const getExamDetail = (examId: string) => apiClient.get(`/api/teacher/exams/${examId}`);
export const getSubmissionDetail = (examId: string, submissionId: string) =>
  apiClient.get(`/api/teacher/exams/${examId}/submissions/${submissionId}`);
export const gradeSubmission = (examId: string, submissionId: string, grades: { grades: { questionId: number; score: number }[] }) =>
  apiClient.post(`/api/teacher/exams/${examId}/submissions/${submissionId}/grade`, grades);
