import api from "./api";

export interface ExamResponse {
  examId: number;
  examName: string;
  subjectId: number;
  subjectName: string;
  facultyId: number;
  facultyName: string;
  department: string;
  semester: number;
  durationMins: number;
  startTime: string;
  endTime: string;
  totalMarks: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  createdAt: string;
}

export interface ExamRequest {
  examName: string;
  subjectId: number;
  durationMins: number;
  startTime: string;
  endTime: string;
  totalMarks: number;
}

export async function getExams(): Promise<ExamResponse[]> {
  const res = await api.get<ExamResponse[]>("/exams");
  return res.data;
}

export async function getExamById(id: number): Promise<ExamResponse> {
  const res = await api.get<ExamResponse>(`/exams/${id}`);
  return res.data;
}

export async function createExam(data: ExamRequest): Promise<ExamResponse> {
  const res = await api.post<ExamResponse>("/exams", data);
  return res.data;
}

export async function updateExam(
  id: number,
  data: ExamRequest
): Promise<ExamResponse> {
  const res = await api.put<ExamResponse>(`/exams/${id}`, data);
  return res.data;
}

export async function deleteExam(id: number): Promise<void> {
  await api.delete(`/exams/${id}`);
}

export async function publishExam(id: number): Promise<ExamResponse> {
  const res = await api.put<ExamResponse>(`/exams/${id}/publish`);
  return res.data;
}

export async function closeExam(id: number): Promise<ExamResponse> {
  const res = await api.put<ExamResponse>(`/exams/${id}/close`);
  return res.data;
}
