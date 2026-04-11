import api from "./api";

export interface SubjectResponse {
  subjectId: number;
  subjectName: string;
  department: string;
  semester: number;
}

export interface SubjectRequest {
  subjectName: string;
  department: string;
  semester: number;
}

export async function getSubjects(): Promise<SubjectResponse[]> {
  const res = await api.get<SubjectResponse[]>("/subjects");
  return res.data;
}

export async function getSubjectById(id: number): Promise<SubjectResponse> {
  const res = await api.get<SubjectResponse>(`/subjects/${id}`);
  return res.data;
}

export async function createSubject(
  data: SubjectRequest
): Promise<SubjectResponse> {
  const res = await api.post<SubjectResponse>("/subjects", data);
  return res.data;
}

export async function updateSubject(
  id: number,
  data: SubjectRequest
): Promise<SubjectResponse> {
  const res = await api.put<SubjectResponse>(`/subjects/${id}`, data);
  return res.data;
}

export async function deleteSubject(id: number): Promise<void> {
  await api.delete(`/subjects/${id}`);
}
