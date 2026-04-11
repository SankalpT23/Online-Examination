import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { QuestionResponse } from "@/lib/questionApi";
import type { AttemptResponse } from "@/lib/attemptApi";
import { toast } from "sonner";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

export default function ExamRoom() {
  const { examId: examIdStr } = useParams<{ examId: string }>();
  const examId = Number(examIdStr);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exams, startAttempt, submitAttempt, fetchQuestions } = useData();

  const exam = exams.find((e) => e.examId === examId);
  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  // Initialize - fetch questions & start attempt
  useEffect(() => {
    if (!exam || !user) return;

    const init = async () => {
      try {
        // Fetch questions first
        const qs = await fetchQuestions(examId);
        setQuestions(qs);

        // Start attempt
        const att = await startAttempt(examId);
        setAttempt(att);

        if (att.status === "SUBMITTED" || att.status === "TIMED_OUT") {
          setSubmitted(true);
          submittedRef.current = true;
        } else {
          // Calculate remaining time from attempt start
          const start = new Date(att.startTime).getTime();
          const durationMs = (att.durationMins || exam.durationMins) * 60 * 1000;
          const remaining = Math.max(0, Math.floor((start + durationMs - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to start exam";
        toast.error(msg);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (submittedRef.current || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }, []);

  const handleSubmit = async (timedOut = false) => {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    // Build answers array for backend
    const answerItems = questions.map((q) => ({
      questionId: q.questionId,
      selectedOption: answers[q.questionId] ?? null,
    }));

    try {
      await submitAttempt(attempt.attemptId, answerItems);
      setSubmitted(true);
      if (timedOut) {
        toast.info("Time's up! Your exam has been auto-submitted.");
      } else {
        toast.success("Exam submitted successfully!");
      }
      setTimeout(() => navigate(`/results/${examId}`), 500);
    } catch (err: unknown) {
      submittedRef.current = false;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to submit";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading exam...
      </div>
    );
  }

  if (!exam) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Exam not found</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-lg font-serif text-foreground">Exam already submitted</p>
        <Button onClick={() => navigate(`/results/${examId}`)}>View Results</Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-lg font-serif text-foreground">No questions in this exam</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const question = questions[currentQ];
  const isLowTime = timeLeft < 300;
  const progress = ((currentQ + 1) / questions.length) * 100;

  const selectOption = (opt: "A" | "B" | "C" | "D") => {
    setAnswers({ ...answers, [question.questionId]: opt });
  };

  const getOptionText = (q: QuestionResponse, key: typeof OPTION_KEYS[number]) => {
    return q[`option${key}` as keyof QuestionResponse] as string;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-serif font-semibold text-foreground text-sm sm:text-base truncate mr-4">{exam.examName}</h1>
          <div className={`flex items-center gap-2 font-mono text-sm font-bold rounded-xl px-4 py-2 transition-all duration-500 ${
            isLowTime ? "bg-destructive/10 text-destructive animate-gentle-pulse" : "bg-secondary text-foreground"
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-0.5 bg-secondary">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl animate-fade-in" key={currentQ}>
          <div className="mb-2 text-sm text-muted-foreground font-medium">
            Question {currentQ + 1} of {questions.length}
            {question.marks > 1 && <span className="ml-2 text-primary">({question.marks} marks)</span>}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-8 leading-relaxed">{question.questionText}</h2>
          <div className="space-y-3">
            {OPTION_KEYS.map((key) => {
              const isSelected = answers[question.questionId] === key;
              const optText = getOptionText(question, key);
              return (
                <button key={key} onClick={() => selectOption(key)}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                    isSelected ? "border-primary bg-primary/5 shadow-soft" : "border-border/50 bg-card hover:border-primary/30 hover:shadow-soft"
                  }`}>
                  <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}>{key}</span>
                  <span className={`text-sm sm:text-base font-medium ${isSelected ? "text-foreground" : "text-foreground/80"}`}>{optText}</span>
                  {isSelected && (
                    <span className="ml-auto text-primary animate-fade-in">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="sticky bottom-0 glass border-t">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((q, i) => (
              <button key={q.questionId} onClick={() => setCurrentQ(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentQ ? "bg-primary scale-125" : answers[q.questionId] !== undefined ? "bg-accent" : "bg-border"
                }`} />
            ))}
          </div>
          {currentQ === questions.length - 1 ? (
            <Button variant="success" onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Submit <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
