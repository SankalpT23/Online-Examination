import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Trophy, Medal, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { ResultResponse, LeaderBoardResponse } from "@/lib/resultApi";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { examId: examIdStr } = useParams<{ examId: string }>();
  const examId = examIdStr ? Number(examIdStr) : undefined;
  const { user } = useAuth();
  const { myResults, fetchLeaderboard, fetchResultsByExam } = useData();

  const [leaderboard, setLeaderboard] = useState<LeaderBoardResponse[]>([]);
  const [examResults, setExamResults] = useState<ResultResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Find my result for this exam
  const myResult = examId ? myResults.find((r) => r.examId === examId) : null;

  // Fetch leaderboard and exam results
  useEffect(() => {
    if (!examId) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [lb, er] = await Promise.all([
          fetchLeaderboard(examId).catch(() => [] as LeaderBoardResponse[]),
          user?.role === "student"
            ? Promise.resolve([] as ResultResponse[])
            : fetchResultsByExam(examId).catch(() => [] as ResultResponse[]),
        ]);
        setLeaderboard(lb);
        setExamResults(er);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = () => {
    if (user?.role === "admin") navigate("/admin");
    else if (user?.role === "faculty") navigate("/faculty");
    else navigate("/dashboard");
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gold/15 text-gold border-gold/30";
    if (rank === 2) return "bg-silver/15 text-silver border-silver/30";
    if (rank === 3) return "bg-bronze/15 text-bronze border-bronze/30";
    return "bg-secondary text-muted-foreground border-border/50";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className={`h-4 w-4 ${rank === 1 ? "text-gold" : rank === 2 ? "text-silver" : "text-bronze"}`} />;
    return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  // If no examId, show all results list
  if (!examId) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 glass border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <span className="text-lg font-serif font-bold text-foreground">Aura Exams</span>
            </div>
            <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Dashboard</Button>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">My Results</h1>
          {myResults.length === 0 && <p className="text-muted-foreground">No results yet. Take an exam first!</p>}
          {myResults.map((r, i) => (
            <ScrollReveal key={r.resultId} delay={i * 60}>
              <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50 flex items-center justify-between cursor-pointer card-hover" onClick={() => navigate(`/results/${r.examId}`)}>
                <div>
                  <h4 className="font-semibold text-foreground">{r.examName}</h4>
                  <p className="text-sm text-muted-foreground">Score: {r.totalScore}/{r.totalMarks} · Grade: {r.grade} · {r.percentage}%</p>
                </div>
                <span className={`text-lg font-bold ${r.percentage >= 60 ? "text-accent" : "text-destructive"}`}>{r.grade}</span>
              </div>
            </ScrollReveal>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-serif font-bold text-foreground">Aura Exams</span>
          </div>
          <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Dashboard</Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {loading && (
          <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading results...</div>
        )}

        {/* Score Hero */}
        {myResult && !loading && (
          <ScrollReveal>
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Examination Complete</p>
              <h1 className="text-5xl sm:text-7xl font-serif font-bold text-foreground mb-2">
                {myResult.totalScore}<span className="text-3xl sm:text-5xl text-muted-foreground">/{myResult.totalMarks}</span>
              </h1>
              <p className="text-xl sm:text-2xl font-serif text-foreground/80 mt-4">{myResult.examName}</p>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
                <span>Grade: <strong className={myResult.percentage >= 40 ? "text-accent" : "text-destructive"}>{myResult.grade}</strong></span>
                <span>Result: <strong className={myResult.result === "PASS" ? "text-accent" : "text-destructive"}>{myResult.result}</strong></span>
                <span>Percentage: <strong className="text-foreground">{myResult.percentage}%</strong></span>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && !loading && (
          <section>
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-6">
                <Medal className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-serif font-semibold text-foreground">Leaderboard</h2>
              </div>
            </ScrollReveal>
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const isMe = entry.studentId === user?.id;
                return (
                  <ScrollReveal key={`${entry.rank}-${entry.studentId}`} delay={entry.rank * 70}>
                    <div className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all ${
                      entry.rank <= 3 ? getRankStyle(entry.rank) : "bg-card border-border/50 shadow-soft"
                    } ${isMe ? "ring-2 ring-primary/30" : ""}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.rank <= 3 ? getRankStyle(entry.rank) : "bg-secondary"}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">{entry.studentName}</span>
                          {isMe && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">YOU</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Score: {entry.score}/{entry.totalMarks} · {entry.grade}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-foreground">{entry.percentage}%</span>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>
        )}

        {leaderboard.length === 0 && !myResult && !loading && (
          <div className="text-center py-12 text-muted-foreground">No results for this exam yet.</div>
        )}
      </main>
    </div>
  );
}
