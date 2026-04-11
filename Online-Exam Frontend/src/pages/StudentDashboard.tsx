import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, ArrowRight, CheckCircle2, Trophy, PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    exams,
    enrollments,
    myResults,
    loadingExams,
    enroll,
    unenroll,
    isEnrolled,
    getEnrollmentId,
    refreshEnrollments,
    refreshResults,
    fetchQuestionCount,
  } = useData();

  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  // Published exams (backend already filters for student, but belt-and-suspenders)
  const publishedExams = exams.filter((e) => e.status === "PUBLISHED");

  // Fetch question counts for published exams
  useEffect(() => {
    publishedExams.forEach(async (exam) => {
      if (questionCounts[exam.examId] === undefined) {
        try {
          const count = await fetchQuestionCount(exam.examId);
          setQuestionCounts((prev) => ({ ...prev, [exam.examId]: count }));
        } catch {
          /* ignore */
        }
      }
    });
  }, [publishedExams.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnroll = async (examId: number) => {
    setEnrollingId(examId);
    try {
      await enroll(examId);
      toast.success("Enrolled successfully!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to enroll";
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (examId: number) => {
    const enrollmentId = getEnrollmentId(examId);
    if (!enrollmentId) return;
    try {
      await unenroll(enrollmentId);
      toast.success("Unenrolled successfully");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to unenroll";
      toast.error(msg);
    }
  };

  const handleStartExam = (examId: number) => {
    const count = questionCounts[examId] ?? 0;
    if (count === 0) {
      toast.error("This exam has no questions yet");
      return;
    }
    navigate(`/exam/${examId}`);
  };

  const hasResult = (examId: number) => myResults.some((r) => r.examId === examId);

  // Check if student has already attempted (from myResults or enrollments status)
  const hasAttempted = (examId: number) => myResults.some((r) => r.examId === examId);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-serif font-bold text-foreground">Aura Exams</span>
          </div>
          <div className="flex items-center gap-3">
            {myResults.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/results")}>
                <Trophy className="h-4 w-4 mr-1" /> Results
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>Sign Out</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <ScrollReveal>
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
              Welcome back, {user?.name || "Student"}.
            </h1>
            <p className="text-muted-foreground text-lg">Ready to learn? You have {enrollments.length} enrollments.</p>
          </div>
        </ScrollReveal>

        {/* Published Exams */}
        <section>
          <ScrollReveal>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif font-semibold text-foreground">Available Exams</h2>
              <span className="text-sm text-muted-foreground">
                {loadingExams ? "Loading..." : `${publishedExams.length} exams`}
              </span>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedExams.map((exam, i) => {
              const enrolled = isEnrolled(exam.examId);
              const completed = hasResult(exam.examId);
              const qCount = questionCounts[exam.examId] ?? "—";

              return (
                <ScrollReveal key={exam.examId} delay={i * 80}>
                  <div className="bg-card rounded-2xl p-6 shadow-soft card-hover border border-border/50">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{exam.subjectName}</span>
                      {completed && <span className="text-xs font-medium px-2 py-1 rounded-lg bg-accent/10 text-accent">Completed</span>}
                    </div>
                    <h3 className="font-serif font-semibold text-foreground text-lg mb-1">{exam.examName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">by {exam.facultyName}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.durationMins} min</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{qCount} Q</span>
                    </div>

                    {completed ? (
                      <Button variant="outline" className="w-full" size="sm" onClick={() => navigate(`/results/${exam.examId}`)}>
                        View Result <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : enrolled ? (
                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm" onClick={() => handleStartExam(exam.examId)}>
                          Start Exam <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleUnenroll(exam.examId)} title="Unenroll">
                          <MinusCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" size="sm" onClick={() => handleEnroll(exam.examId)} disabled={enrollingId === exam.examId}>
                        {enrollingId === exam.examId ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />} Enroll
                      </Button>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
            {publishedExams.length === 0 && !loadingExams && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No published exams available yet.</div>
            )}
            {loadingExams && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading exams...
              </div>
            )}
          </div>
        </section>

        {/* My Results */}
        {myResults.length > 0 && (
          <section>
            <ScrollReveal>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-5">My Results</h2>
            </ScrollReveal>
            <div className="space-y-3">
              {myResults.map((r, i) => (
                <ScrollReveal key={r.resultId} delay={i * 60}>
                  <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <div>
                        <h4 className="font-semibold text-foreground">{r.examName}</h4>
                        <p className="text-sm text-muted-foreground">Score: {r.totalScore}/{r.totalMarks} · Grade: {r.grade}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/results/${r.examId}`)}>View</Button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
