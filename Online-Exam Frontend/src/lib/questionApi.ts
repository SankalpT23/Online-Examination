import api from "./api";

export interface QuestionResponse {
  questionId: number;
  examId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D" | null;
  marks: number;
}

export interface QuestionRequest {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
}

export async function getQuestions(
  examId: number
): Promise<QuestionResponse[]> {
  const res = await api.get<QuestionResponse[]>(
    `/exams/${examId}/questions`
  );
  return res.data;
}

export async function getQuestionCount(
  examId: number
): Promise<number> {
  const res = await api.get<{ totalQuestions: number }>(
    `/exams/${examId}/questions/count`
  );
  return res.data.totalQuestions;
}

export async function addQuestion(
  examId: number,
  data: QuestionRequest
): Promise<QuestionResponse> {
  const res = await api.post<QuestionResponse>(
    `/exams/${examId}/questions`,
    data
  );
  return res.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await api.delete(`/questions/${id}`);
}
