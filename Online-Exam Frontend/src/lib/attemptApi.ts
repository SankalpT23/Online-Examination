import api from "./api";

export interface AttemptResponse {
  attemptId: number;
  studentId: number;
  studentName: string;
  examId: number;
  examName: string;
  durationMins: number;
  startTime: string;
  submitTime: string | null;
  examEndTime: string;
  score: number | null;
  totalMarks: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";
  message: string;
}

export interface AnswerItem {
  questionId: number;
  selectedOption: "A" | "B" | "C" | "D" | null;
}

export interface SubmitAnswerRequest {
  answers: AnswerItem[];
}

export async function startAttempt(
  examId: number
): Promise<AttemptResponse> {
  const res = await api.post<AttemptResponse>(`/attempts/start/${examId}`);
  return res.data;
}

export async function submitAttempt(
  attemptId: number,
  data: SubmitAnswerRequest
): Promise<AttemptResponse> {
  const res = await api.post<AttemptResponse>(
    `/attempts/submit/${attemptId}`,
    data
  );
  return res.data;
}

export async function getMyAttempts(): Promise<AttemptResponse[]> {
  const res = await api.get<AttemptResponse[]>("/attempts/my");
  return res.data;
}

export async function getAttemptsByExam(
  examId: number
): Promise<AttemptResponse[]> {
  const res = await api.get<AttemptResponse[]>(`/attempts/exam/${examId}`);
  return res.data;
}
