import api from "./api";

export interface AdminDashboardResponse {
  totalStudents: number;
  totalFaculty: number;
  totalExams: number;
  publishedExams: number;
  totalAttempts: number;
  totalResults: number;
}

export interface StudentSummaryResponse {
  studentId: number;
  name: string;
  email: string;
  department: string;
  semester: number;
  totalAttempts: number;
}

export interface FacultySummaryResponse {
  facultyId: number;
  name: string;
  email: string;
  department: string;
  totalExams: number;
}

export interface WeakQuestionResponse {
  questionId: number;
  questionText: string;
  correctOption: string;
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyPercentage: number;
}

export async function getDashboardStats(): Promise<AdminDashboardResponse> {
  const res = await api.get<AdminDashboardResponse>("/admin/dashboard");
  return res.data;
}

export async function getStudents(): Promise<StudentSummaryResponse[]> {
  const res = await api.get<StudentSummaryResponse[]>("/admin/students");
  return res.data;
}

export async function getFaculty(): Promise<FacultySummaryResponse[]> {
  const res = await api.get<FacultySummaryResponse[]>("/admin/faculty");
  return res.data;
}

export async function getWeakQuestions(
  examId: number
): Promise<WeakQuestionResponse[]> {
  const res = await api.get<WeakQuestionResponse[]>(
    `/admin/weak-questions/${examId}`
  );
  return res.data;
}
