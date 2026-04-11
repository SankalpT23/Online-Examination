import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import * as examApi from "@/lib/examApi";
import * as questionApi from "@/lib/questionApi";
import * as subjectApi from "@/lib/subjectApi";
import * as enrollmentApi from "@/lib/enrollmentApi";
import * as attemptApi from "@/lib/attemptApi";
import * as resultApi from "@/lib/resultApi";
import * as adminApi from "@/lib/adminApi";

// ─── Re-export API types for convenience ────────────────────────
export type { ExamResponse } from "@/lib/examApi";
export type { QuestionResponse } from "@/lib/questionApi";
export type { SubjectResponse } from "@/lib/subjectApi";
export type { EnrollmentResponse } from "@/lib/enrollmentApi";
export type { AttemptResponse } from "@/lib/attemptApi";
export type { ResultResponse, LeaderBoardResponse, ExamReportResponse } from "@/lib/resultApi";
export type {
  AdminDashboardResponse,
  StudentSummaryResponse,
  FacultySummaryResponse,
  WeakQuestionResponse,
} from "@/lib/adminApi";

// ─── Store Interface ────────────────────────────────────────────
interface DataStore {
  // State
  subjects: subjectApi.SubjectResponse[];
  exams: examApi.ExamResponse[];
  enrollments: enrollmentApi.EnrollmentResponse[];
  myResults: resultApi.ResultResponse[];
  loadingExams: boolean;
  loadingSubjects: boolean;

  // Refresh
  refreshExams: () => Promise<void>;
  refreshSubjects: () => Promise<void>;
  refreshEnrollments: () => Promise<void>;
  refreshResults: () => Promise<void>;

  // Subject CRUD (admin & faculty)
  addSubject: (data: subjectApi.SubjectRequest) => Promise<subjectApi.SubjectResponse>;
  removeSubject: (id: number) => Promise<void>;

  // Exam CRUD (faculty)
  addExam: (data: examApi.ExamRequest) => Promise<void>;
  removeExam: (id: number) => Promise<void>;
  publishExam: (id: number) => Promise<void>;
  closeExam: (id: number) => Promise<void>;

  // Questions (faculty)
  fetchQuestions: (examId: number) => Promise<questionApi.QuestionResponse[]>;
  fetchQuestionCount: (examId: number) => Promise<number>;
  addQuestion: (
    examId: number,
    data: questionApi.QuestionRequest
  ) => Promise<void>;
  removeQuestion: (id: number) => Promise<void>;

  // Enrollment (student)
  enroll: (examId: number) => Promise<void>;
  unenroll: (enrollmentId: number) => Promise<void>;
  isEnrolled: (examId: number) => boolean;
  getEnrollmentId: (examId: number) => number | null;

  // Enrollment (faculty/admin)
  fetchEnrollmentCount: (examId: number) => Promise<number>;

  // Attempts (student)
  startAttempt: (examId: number) => Promise<attemptApi.AttemptResponse>;
  submitAttempt: (
    attemptId: number,
    answers: attemptApi.AnswerItem[]
  ) => Promise<attemptApi.AttemptResponse>;
  fetchMyAttempts: () => Promise<attemptApi.AttemptResponse[]>;

  // Results
  fetchResultsByExam: (examId: number) => Promise<resultApi.ResultResponse[]>;
  fetchLeaderboard: (
    examId: number
  ) => Promise<resultApi.LeaderBoardResponse[]>;
  fetchExamReport: () => Promise<resultApi.ExamReportResponse[]>;

  // Admin
  fetchDashboardStats: () => Promise<adminApi.AdminDashboardResponse>;
  fetchStudents: () => Promise<adminApi.StudentSummaryResponse[]>;
  fetchFaculty: () => Promise<adminApi.FacultySummaryResponse[]>;
  fetchWeakQuestions: (
    examId: number
  ) => Promise<adminApi.WeakQuestionResponse[]>;
}

const DataContext = createContext<DataStore>({} as DataStore);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<subjectApi.SubjectResponse[]>([]);
  const [exams, setExams] = useState<examApi.ExamResponse[]>([]);
  const [enrollments, setEnrollments] = useState<
    enrollmentApi.EnrollmentResponse[]
  >([]);
  const [myResults, setMyResults] = useState<resultApi.ResultResponse[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // ─── Refresh helpers ─────────────────────────────────────────
  const refreshSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      setSubjects(await subjectApi.getSubjects());
    } catch {
      /* handled by interceptor */
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  const refreshExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      setExams(await examApi.getExams());
    } catch {
      /* handled by interceptor */
    } finally {
      setLoadingExams(false);
    }
  }, []);

  const refreshEnrollments = useCallback(async () => {
    if (!user || user.role !== "student") return;
    try {
      setEnrollments(await enrollmentApi.getMyEnrollments());
    } catch {
      /* handled by interceptor */
    }
  }, [user]);

  const refreshResults = useCallback(async () => {
    if (!user || user.role !== "student") return;
    try {
      setMyResults(await resultApi.getMyResults());
    } catch {
      /* handled by interceptor */
    }
  }, [user]);

  // ─── Auto-fetch on login ────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setExams([]);
      setEnrollments([]);
      setMyResults([]);
      return;
    }
    refreshSubjects();
    refreshExams();
    if (user.role === "student") {
      refreshEnrollments();
      refreshResults();
    }
  }, [user, refreshSubjects, refreshExams, refreshEnrollments, refreshResults]);

  // ─── Subject CRUD ────────────────────────────────────────────
  const addSubject = useCallback(
    async (data: subjectApi.SubjectRequest) => {
      const res = await subjectApi.createSubject(data);
      await refreshSubjects();
      return res;
    },
    [refreshSubjects]
  );

  const removeSubject = useCallback(
    async (id: number) => {
      await subjectApi.deleteSubject(id);
      await refreshSubjects();
    },
    [refreshSubjects]
  );

  // ─── Exam CRUD ───────────────────────────────────────────────
  const addExam = useCallback(
    async (data: examApi.ExamRequest) => {
      await examApi.createExam(data);
      await refreshExams();
    },
    [refreshExams]
  );

  const removeExam = useCallback(
    async (id: number) => {
      await examApi.deleteExam(id);
      await refreshExams();
    },
    [refreshExams]
  );

  const doPublishExam = useCallback(
    async (id: number) => {
      await examApi.publishExam(id);
      await refreshExams();
    },
    [refreshExams]
  );

  const doCloseExam = useCallback(
    async (id: number) => {
      await examApi.closeExam(id);
      await refreshExams();
    },
    [refreshExams]
  );

  // ─── Questions ───────────────────────────────────────────────
  const fetchQuestions = useCallback(
    async (examId: number) => questionApi.getQuestions(examId),
    []
  );

  const fetchQuestionCount = useCallback(
    async (examId: number) => questionApi.getQuestionCount(examId),
    []
  );

  const addQuestion = useCallback(
    async (examId: number, data: questionApi.QuestionRequest) => {
      await questionApi.addQuestion(examId, data);
    },
    []
  );

  const removeQuestion = useCallback(async (id: number) => {
    await questionApi.deleteQuestion(id);
  }, []);

  // ─── Enrollment ──────────────────────────────────────────────
  const doEnroll = useCallback(
    async (examId: number) => {
      await enrollmentApi.enroll(examId);
      await refreshEnrollments();
    },
    [refreshEnrollments]
  );

  const doUnenroll = useCallback(
    async (enrollmentId: number) => {
      await enrollmentApi.unenroll(enrollmentId);
      await refreshEnrollments();
    },
    [refreshEnrollments]
  );

  const isEnrolled = useCallback(
    (examId: number) => enrollments.some((e) => e.examId === examId),
    [enrollments]
  );

  const getEnrollmentId = useCallback(
    (examId: number): number | null => {
      const en = enrollments.find((e) => e.examId === examId);
      return en ? en.enrollmentId : null;
    },
    [enrollments]
  );

  const fetchEnrollmentCount = useCallback(
    async (examId: number) => enrollmentApi.getEnrollmentCount(examId),
    []
  );

  // ─── Attempts ────────────────────────────────────────────────
  const doStartAttempt = useCallback(
    async (examId: number) => attemptApi.startAttempt(examId),
    []
  );

  const doSubmitAttempt = useCallback(
    async (attemptId: number, answers: attemptApi.AnswerItem[]) =>
      attemptApi.submitAttempt(attemptId, { answers }),
    []
  );

  const fetchMyAttempts = useCallback(
    async () => attemptApi.getMyAttempts(),
    []
  );

  // ─── Results ─────────────────────────────────────────────────
  const fetchResultsByExam = useCallback(
    async (examId: number) => resultApi.getResultsByExam(examId),
    []
  );

  const fetchLeaderboard = useCallback(
    async (examId: number) => resultApi.getLeaderboard(examId),
    []
  );

  const fetchExamReport = useCallback(
    async () => resultApi.getExamReport(),
    []
  );

  // ─── Admin ───────────────────────────────────────────────────
  const fetchDashboardStats = useCallback(
    async () => adminApi.getDashboardStats(),
    []
  );

  const fetchStudents = useCallback(
    async () => adminApi.getStudents(),
    []
  );

  const fetchFaculty = useCallback(async () => adminApi.getFaculty(), []);

  const fetchWeakQuestions = useCallback(
    async (examId: number) => adminApi.getWeakQuestions(examId),
    []
  );

  return (
    <DataContext.Provider
      value={{
        subjects,
        exams,
        enrollments,
        myResults,
        loadingExams,
        loadingSubjects,
        refreshExams,
        refreshSubjects,
        refreshEnrollments,
        refreshResults,
        addSubject,
        removeSubject,
        addExam,
        removeExam,
        publishExam: doPublishExam,
        closeExam: doCloseExam,
        fetchQuestions,
        fetchQuestionCount,
        addQuestion,
        removeQuestion,
        enroll: doEnroll,
        unenroll: doUnenroll,
        isEnrolled,
        getEnrollmentId,
        fetchEnrollmentCount,
        startAttempt: doStartAttempt,
        submitAttempt: doSubmitAttempt,
        fetchMyAttempts,
        fetchResultsByExam,
        fetchLeaderboard,
        fetchExamReport,
        fetchDashboardStats,
        fetchStudents,
        fetchFaculty,
        fetchWeakQuestions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
