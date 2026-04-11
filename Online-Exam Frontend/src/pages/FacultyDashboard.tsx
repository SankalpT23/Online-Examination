import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Clock, Users, X, ChevronRight, Trash2, Eye, ArrowUpRight, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { QuestionResponse } from "@/lib/questionApi";
import type { ResultResponse } from "@/lib/resultApi";
import { toast } from "sonner";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    subjects,
    exams,
    addSubject,
    addExam,
    removeExam,
    publishExam,
    closeExam,
    fetchQuestions,
    addQuestion,
    removeQuestion,
    fetchEnrollmentCount,
    fetchResultsByExam,
    refreshExams,
  } = useData();

  // Faculty's own exams
  const myExams = exams.filter((e) => e.facultyId === user?.id);

  const [showCreateExam, setShowCreateExam] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [showQuestions, setShowQuestions] = useState<number | null>(null);
  const [showAddQ, setShowAddQ] = useState(false);
  const [showReport, setShowReport] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Enrollment counts cache
  const [enrollCounts, setEnrollCounts] = useState<Record<number, number>>({});

  // Question list for selected exam
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loadingQs, setLoadingQs] = useState(false);

  // Report data
  const [reportResults, setReportResults] = useState<ResultResponse[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);

  // Exam form state
  const [ef, setEf] = useState({ name: "", subjectId: "", duration: "90", totalMarks: "100", startTime: "", endTime: "", newSubjectName: "", newDepartment: "", newSemester: "" });
  // Question form state
  const [qf, setQf] = useState({ text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" as "A" | "B" | "C" | "D", marks: "1" });

  // Fetch enrollment counts
  useEffect(() => {
    myExams.forEach(async (exam) => {
      if (enrollCounts[exam.examId] === undefined) {
        try {
          const count = await fetchEnrollmentCount(exam.examId);
          setEnrollCounts((prev) => ({ ...prev, [exam.examId]: count }));
        } catch { /* ignore */ }
      }
    });
  }, [myExams.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch questions when panel opens
  const loadQuestions = useCallback(async (examId: number) => {
    setLoadingQs(true);
    try {
      setQuestions(await fetchQuestions(examId));
    } catch { /* ignore */ }
    setLoadingQs(false);
  }, [fetchQuestions]);

  useEffect(() => {
    if (showQuestions !== null) loadQuestions(showQuestions);
  }, [showQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch report
  useEffect(() => {
    if (showReport !== null) {
      setLoadingReport(true);
      fetchResultsByExam(showReport)
        .then(setReportResults)
        .catch(() => {})
        .finally(() => setLoadingReport(false));
    }
  }, [showReport]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ef.name || (!ef.subjectId && (!isNewSubject || !ef.newSubjectName || !ef.newDepartment || !ef.newSemester)) || !ef.startTime || !ef.endTime) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      let activeSubjectId = parseInt(ef.subjectId);

      if (isNewSubject) {
        const newSub = await addSubject({
          subjectName: ef.newSubjectName,
          department: ef.newDepartment,
          semester: parseInt(ef.newSemester) || 1
        });
        activeSubjectId = newSub.subjectId;
      }

      await addExam({
        examName: ef.name,
        subjectId: activeSubjectId,
        durationMins: parseInt(ef.duration) || 90,
        totalMarks: parseInt(ef.totalMarks) || 100,
        startTime: ef.startTime,
        endTime: ef.endTime,
      });
      toast.success(`Exam "${ef.name}" created as DRAFT`);
      setEf({ name: "", subjectId: "", duration: "90", totalMarks: "100", startTime: "", endTime: "", newSubjectName: "", newDepartment: "", newSemester: "" });
      setIsNewSubject(false);
      setShowCreateExam(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create exam";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (examId: number) => {
    try {
      await publishExam(examId);
      toast.success("Exam published!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to publish";
      toast.error(msg);
    }
  };

  const handleClose = async (examId: number) => {
    try {
      await closeExam(examId);
      toast.success("Exam closed");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to close";
      toast.error(msg);
    }
  };

  const handleDelete = async (examId: number) => {
    try {
      await removeExam(examId);
      toast.success("Exam deleted");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete";
      toast.error(msg);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuestions || !qf.text || !qf.optionA || !qf.optionB || !qf.optionC || !qf.optionD) {
      toast.error("Fill all fields");
      return;
    }
    setSaving(true);
    try {
      await addQuestion(showQuestions, {
        questionText: qf.text,
        optionA: qf.optionA,
        optionB: qf.optionB,
        optionC: qf.optionC,
        optionD: qf.optionD,
        correctOption: qf.correctOption,
        marks: parseInt(qf.marks) || 1,
      });
      toast.success("Question added");
      setQf({ text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: "1" });
      setShowAddQ(false);
      loadQuestions(showQuestions);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add question";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    try {
      await removeQuestion(qId);
      toast.success("Question deleted");
      if (showQuestions) loadQuestions(showQuestions);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete";
      toast.error(msg);
    }
  };

  const currentExam = exams.find((e) => e.examId === showQuestions);
  const reportExam = exams.find((e) => e.examId === showReport);

  const statusColor = (s: string) => {
    if (s === "DRAFT") return "bg-secondary text-muted-foreground";
    if (s === "PUBLISHED") return "bg-accent/10 text-accent";
    return "bg-primary/10 text-primary";
  };

  const optionKeys = ["A", "B", "C", "D"] as const;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-serif font-bold text-foreground">Aura Exams</span>
            <span className="text-xs bg-lavender/15 text-lavender-foreground font-semibold px-2 py-0.5 rounded-lg ml-2">Faculty</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>Sign Out</Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Exam Management</h1>
              <p className="text-muted-foreground mt-1">Create exams, add questions, then publish</p>
            </div>
            <Button onClick={() => setShowCreateExam(true)}><Plus className="h-4 w-4" /> Create Exam</Button>
          </div>
        </ScrollReveal>

        {/* Exams Table */}
        <ScrollReveal delay={100}>
          <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Exam</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Marks</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Duration</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Enrolled</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myExams.map((exam) => (
                    <tr key={exam.examId} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{exam.examName}</div>
                        <div className="text-xs text-muted-foreground">{exam.subjectName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{exam.totalMarks}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.durationMins} min</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{enrollCounts[exam.examId] ?? "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColor(exam.status)}`}>{exam.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setShowQuestions(exam.examId); setShowAddQ(false); }} title="View Questions">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {exam.status === "DRAFT" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handlePublish(exam.examId)} className="text-accent" title="Publish">
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.examId)} className="text-destructive" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {exam.status === "PUBLISHED" && (
                            <Button variant="ghost" size="sm" onClick={() => handleClose(exam.examId)} className="text-destructive" title="Close Exam">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {exam.status !== "DRAFT" && (
                            <Button variant="ghost" size="sm" onClick={() => setShowReport(exam.examId)} title="View Report">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myExams.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No exams yet. Create your first exam!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* ─── Create Exam Modal ─── */}
      {showCreateExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowCreateExam(false)} />
          <div className="relative bg-card rounded-2xl shadow-elevated border border-border/50 w-full max-w-lg p-6 sm:p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreateExam(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">Create New Exam</h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Exam Name</Label>
                <Input value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} placeholder="e.g. Advanced Data Structures" className="h-11 rounded-xl bg-secondary/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-foreground font-medium">Subject</Label>
                  <Button type="button" variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => setIsNewSubject(!isNewSubject)}>
                    {isNewSubject ? "Select Existing" : "+ Create New Subject"}
                  </Button>
                </div>
                {isNewSubject ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input value={ef.newSubjectName} onChange={e => setEf({...ef, newSubjectName: e.target.value})} placeholder="Subject Name" className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                    <Input value={ef.newDepartment} onChange={e => setEf({...ef, newDepartment: e.target.value})} placeholder="Department" className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                    <Input type="number" value={ef.newSemester} onChange={e => setEf({...ef, newSemester: e.target.value})} placeholder="Semester" className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                  </div>
                ) : (
                  <select value={ef.subjectId} onChange={(e) => setEf({ ...ef, subjectId: e.target.value })} className="w-full h-11 rounded-xl bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.subjectId} value={s.subjectId}>{s.subjectName} ({s.department} S{s.semester})</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Duration (min)</Label>
                  <Input type="number" value={ef.duration} onChange={(e) => setEf({ ...ef, duration: e.target.value })} className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Total Marks</Label>
                  <Input type="number" value={ef.totalMarks} onChange={(e) => setEf({ ...ef, totalMarks: e.target.value })} className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Start Time</Label>
                  <Input type="datetime-local" value={ef.startTime} onChange={(e) => setEf({ ...ef, startTime: e.target.value })} className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">End Time</Label>
                  <Input type="datetime-local" value={ef.endTime} onChange={(e) => setEf({ ...ef, endTime: e.target.value })} className="h-11 rounded-xl bg-secondary/50 border-border/50" />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl mt-2" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create as DRAFT
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Questions Panel ─── */}
      {showQuestions !== null && currentExam && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowQuestions(null)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-elevated border border-border/50 w-full sm:max-w-2xl p-6 animate-fade-in-up max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowQuestions(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <h2 className="text-xl font-serif font-bold text-foreground mb-1">{currentExam.examName}</h2>
            <p className="text-sm text-muted-foreground mb-6">{questions.length} questions · {currentExam.status}</p>

            {loadingQs ? (
              <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (
              questions.map((q, i) => (
                <div key={q.questionId} className="bg-secondary/30 rounded-xl p-4 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Q{i + 1}. {q.questionText}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Marks: {q.marks}</p>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {optionKeys.map((key) => (
                          <span key={key} className={`text-xs px-2 py-1 rounded ${q.correctOption === key ? "bg-accent/15 text-accent font-semibold" : "text-muted-foreground"}`}>
                            {key}. {q[`option${key}` as keyof typeof q]}
                          </span>
                        ))}
                      </div>
                    </div>
                    {currentExam.status === "DRAFT" && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.questionId)} className="text-destructive ml-2">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}

            {currentExam.status === "DRAFT" && !showAddQ && (
              <Button variant="outline" className="w-full mt-2" onClick={() => setShowAddQ(true)}>
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            )}

            {showAddQ && (
              <form onSubmit={handleAddQuestion} className="bg-secondary/20 rounded-xl p-4 mt-3 space-y-3 animate-fade-in-up">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">Question Text</Label>
                  <Input value={qf.text} onChange={(e) => setQf({ ...qf, text: e.target.value })} placeholder="Enter question..." className="h-10 rounded-lg bg-card border-border/50 text-sm" />
                </div>
                {optionKeys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <button type="button" onClick={() => setQf({ ...qf, correctOption: key })}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0 ${qf.correctOption === key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {key}
                    </button>
                    <Input
                      value={qf[`option${key}` as keyof typeof qf] as string}
                      onChange={(e) => setQf({ ...qf, [`option${key}`]: e.target.value })}
                      placeholder={`Option ${key}`}
                      className="h-9 rounded-lg bg-card border-border/50 text-sm flex-1"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">Marks</Label>
                  <Input type="number" value={qf.marks} onChange={(e) => setQf({ ...qf, marks: e.target.value })} className="h-9 rounded-lg bg-card border-border/50 text-sm w-24" />
                </div>
                <p className="text-[11px] text-muted-foreground">Click the letter button to mark the correct answer (highlighted in green).</p>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Add Question
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddQ(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Report Panel ─── */}
      {showReport !== null && reportExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowReport(null)} />
          <div className="relative bg-card rounded-2xl shadow-elevated border border-border/50 w-full max-w-lg p-6 animate-fade-in-up max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowReport(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <h2 className="text-xl font-serif font-bold text-foreground mb-1">{reportExam.examName} — Report</h2>
            <p className="text-sm text-muted-foreground mb-6">{reportResults.length} submissions</p>

            {loadingReport ? (
              <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : reportResults.length > 0 ? (
              <>
                <h3 className="text-sm font-semibold text-foreground mb-3">Results</h3>
                {reportResults.sort((a, b) => b.percentage - a.percentage).map((r, i) => (
                  <div key={r.resultId} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-foreground">{i + 1}. {r.studentName}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-foreground">{r.totalScore}/{r.totalMarks}</span>
                      <span className="text-muted-foreground ml-2">({r.grade})</span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No submissions yet for this exam.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
