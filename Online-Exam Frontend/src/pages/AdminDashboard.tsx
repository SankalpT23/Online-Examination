import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Trash2, BarChart3, Users, FileText, X, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import type { AdminDashboardResponse, StudentSummaryResponse, FacultySummaryResponse } from "@/lib/adminApi";
import { toast } from "sonner";

type Tab = "subjects" | "students" | "faculty";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { subjects, exams, addSubject, removeSubject, fetchDashboardStats, fetchStudents, fetchFaculty } = useData();

  const [activeTab, setActiveTab] = useState<Tab>("subjects");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Subject form
  const [subjectName, setSubjectName] = useState("");
  const [subjectDept, setSubjectDept] = useState("");
  const [subjectSem, setSubjectSem] = useState(1);

  // Dashboard stats
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null);

  // Student / Faculty lists
  const [students, setStudents] = useState<StudentSummaryResponse[]>([]);
  const [faculty, setFaculty] = useState<FacultySummaryResponse[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Fetch stats
  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch list on tab change
  useEffect(() => {
    if (activeTab === "students" && students.length === 0) {
      setLoadingList(true);
      fetchStudents().then(setStudents).catch(() => {}).finally(() => setLoadingList(false));
    }
    if (activeTab === "faculty" && faculty.length === 0) {
      setLoadingList(true);
      fetchFaculty().then(setFaculty).catch(() => {}).finally(() => setLoadingList(false));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectDept.trim()) {
      toast.error("Subject name and department are required");
      return;
    }
    setSaving(true);
    try {
      await addSubject({ subjectName: subjectName.trim(), department: subjectDept.trim(), semester: subjectSem });
      toast.success(`Subject "${subjectName}" created`);
      setSubjectName("");
      setSubjectDept("");
      setSubjectSem(1);
      setShowAdd(false);
      // Refresh stats
      fetchDashboardStats().then(setStats).catch(() => {});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create subject";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await removeSubject(id);
      toast.success(`Subject "${name}" deleted`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete subject";
      toast.error(msg);
    }
  };

  const statItems = [
    { label: "Subjects", value: stats?.totalExams !== undefined ? subjects.length : "—", icon: FileText, color: "text-primary" },
    { label: "Published Exams", value: stats?.publishedExams ?? "—", icon: BarChart3, color: "text-accent" },
    { label: "Total Students", value: stats?.totalStudents ?? "—", icon: GraduationCap, color: "text-lavender" },
    { label: "Total Faculty", value: stats?.totalFaculty ?? "—", icon: Users, color: "text-gold" },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "subjects", label: "Subjects" },
    { key: "students", label: "Students" },
    { key: "faculty", label: "Faculty" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-serif font-bold text-foreground">Aura Exams</span>
            <span className="text-xs bg-destructive/10 text-destructive font-semibold px-2 py-0.5 rounded-lg ml-2">Admin</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>Sign Out</Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Greeting */}
        <ScrollReveal>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage subjects, view students, faculty, and system analytics</p>
        </ScrollReveal>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 60}>
              <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <section>
            <ScrollReveal>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-serif font-semibold text-foreground">Subjects</h2>
                <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Subject</Button>
              </div>
            </ScrollReveal>

            <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Name</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Department</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Semester</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Exams</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => {
                    const examCount = exams.filter((e) => e.subjectId === s.subjectId).length;
                    return (
                      <tr key={s.subjectId} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{s.subjectName}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{s.department}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{s.semester}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{examCount} exams</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(s.subjectId, s.subjectName)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {subjects.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No subjects yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <section>
            <ScrollReveal>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-5">Registered Students</h2>
            </ScrollReveal>
            {loadingList ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...</div>
            ) : (
              <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Name</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Email</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Department</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Semester</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.studentId} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{s.email}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{s.department}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{s.semester}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{s.totalAttempts}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No students registered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Faculty Tab */}
        {activeTab === "faculty" && (
          <section>
            <ScrollReveal>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-5">Registered Faculty</h2>
            </ScrollReveal>
            {loadingList ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...</div>
            ) : (
              <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Name</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Email</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">Department</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Exams</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map((f) => (
                      <tr key={f.facultyId} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{f.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{f.email}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{f.department}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{f.totalExams}</td>
                      </tr>
                    ))}
                    {faculty.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No faculty registered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Add Subject Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-card rounded-2xl shadow-elevated border border-border/50 w-full max-w-sm p-6 animate-fade-in-up">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-serif font-bold text-foreground mb-4">Add Subject</h2>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Subject Name</Label>
                <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Computer Science" className="h-11 rounded-xl bg-secondary/50 border-border/50" autoFocus />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Department</Label>
                <Input value={subjectDept} onChange={(e) => setSubjectDept(e.target.value)} placeholder="e.g. CSE" className="h-11 rounded-xl bg-secondary/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Semester</Label>
                <select value={subjectSem} onChange={(e) => setSubjectSem(parseInt(e.target.value))} className="w-full h-11 rounded-xl bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Subject
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
