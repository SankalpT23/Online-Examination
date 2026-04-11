import api from "./api";

export interface ResultResponse {
  resultId: number;
  attemptId: number;
  studentId: number;
  studentName: string;
  examId: number;
  examName: string;
  subjectName: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  result: string; // "PASS" | "FAIL"
  resultDate: string;
}

export interface LeaderBoardResponse {
  rank: number;
  studentId: number;
  studentName: string;
  department: string;
  semester: number;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
}

export interface ExamReportResponse {
  examId: number;
  examName: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
}

export async function getMyResults(): Promise<ResultResponse[]> {
  const res = await api.get<ResultResponse[]>("/results/my");
  return res.data;
}

export async function getResultByAttempt(
  attemptId: number
): Promise<ResultResponse> {
  const res = await api.get<ResultResponse>(`/results/attempt/${attemptId}`);
  return res.data;
}

export async function getResultsByExam(
  examId: number
): Promise<ResultResponse[]> {
  const res = await api.get<ResultResponse[]>(`/results/exam/${examId}`);
  return res.data;
}

export async function getLeaderboard(
  examId: number
): Promise<LeaderBoardResponse[]> {
  const res = await api.get<LeaderBoardResponse[]>(
    `/results/leaderboard/${examId}`
  );
  return res.data;
}

export async function getExamReport(): Promise<ExamReportResponse[]> {
  const res = await api.get<ExamReportResponse[]>("/results/report");
  return res.data;
}
