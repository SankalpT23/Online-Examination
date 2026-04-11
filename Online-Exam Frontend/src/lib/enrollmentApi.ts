import api from "./api";

export interface EnrollmentResponse {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  examId: number;
  examName: string;
  subjectName: string;
  facultyName: string;
  durationMins: number;
  examStartTime: string;
  examEndTime: string;
  totalMarks: number;
  examStatus: string;
  enrolledDate: string;
  studentEmail: string;
}

export async function getMyEnrollments(): Promise<EnrollmentResponse[]> {
  const res = await api.get<EnrollmentResponse[]>("/enrollments/my");
  return res.data;
}

export async function enroll(examId: number): Promise<EnrollmentResponse> {
  const res = await api.post<EnrollmentResponse>("/enrollments", { examId });
  return res.data;
}

export async function unenroll(id: number): Promise<void> {
  await api.delete(`/enrollments/${id}`);
}

export async function getEnrollmentsByExam(
  examId: number
): Promise<EnrollmentResponse[]> {
  const res = await api.get<EnrollmentResponse[]>(
    `/enrollments/exam/${examId}`
  );
  return res.data;
}

export async function getEnrollmentCount(
  examId: number
): Promise<number> {
  const res = await api.get<{ enrolledCount: number }>(
    `/enrollments/exam/${examId}/count`
  );
  return res.data.enrolledCount;
}
