import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { BookOpen, GraduationCap, ShieldCheck, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Mode = "login" | "register";

const loginRoles: { value: UserRole; label: string; icon: typeof GraduationCap }[] = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "faculty", label: "Faculty", icon: Users },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

const registerRoles: { value: UserRole; label: string; icon: typeof GraduationCap }[] = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "faculty", label: "Faculty", icon: Users },
];

export default function AuthPage() {
  const [role, setRole] = useState<UserRole>("student");
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState(1);
  const { login, registerStudent, registerFaculty, loading } = useAuth();
  const navigate = useNavigate();

  const roles = mode === "login" ? loginRoles : registerRoles;

  // Reset role if switching to register and admin was selected
  const handleModeSwitch = () => {
    const newMode = mode === "login" ? "register" : "login";
    setMode(newMode);
    if (newMode === "register" && role === "admin") {
      setRole("student");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    let error: string | null;

    if (mode === "login") {
      error = await login(email, password, role);
    } else {
      if (!name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!department.trim()) {
        toast.error("Department is required");
        return;
      }

      if (role === "student") {
        error = await registerStudent(name, email, password, department, semester);
      } else {
        error = await registerFaculty(name, email, password, department);
      }
    }

    if (error) {
      toast.error(error);
    } else {
      toast.success(mode === "login" ? `Signed in successfully` : "Account created successfully");
      if (role === "admin") navigate("/admin");
      else if (role === "faculty") navigate("/faculty");
      else navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 animate-gradient items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary-foreground/20" style={{ width: `${120 + i * 60}px`, height: `${120 + i * 60}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%` }} />
          ))}
        </div>
        <div className="relative z-10 text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-3xl font-serif font-bold tracking-tight">Aura Exams</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight mb-6">Where Knowledge Meets Clarity</h1>
          <p className="text-lg opacity-90 leading-relaxed font-sans">A serene, focused examination experience designed to bring out your best performance.</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <BookOpen className="h-8 w-8 text-primary" strokeWidth={1.5} />
            <span className="text-2xl font-serif font-bold text-foreground">Aura Exams</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === "login" ? "Sign in to continue your journey" : "Join Aura Exams today"}
          </p>

          {/* Role Selector */}
          <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6">
            {roles.map((r) => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${role === r.value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
                <r.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div className="space-y-2 animate-fade-in-up">
                <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors" />
            </div>

            {/* Department — shown for register (both student & faculty) */}
            {mode === "register" && (
              <div className="space-y-2 animate-fade-in-up">
                <Label htmlFor="department" className="text-foreground font-medium">Department</Label>
                <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors" />
              </div>
            )}

            {/* Semester — shown only for student registration */}
            {mode === "register" && role === "student" && (
              <div className="space-y-2 animate-fade-in-up">
                <Label htmlFor="semester" className="text-foreground font-medium">Semester</Label>
                <select
                  id="semester"
                  value={semester}
                  onChange={e => setSemester(parseInt(e.target.value))}
                  className="w-full h-12 rounded-xl bg-secondary/50 border border-border/50 px-3 text-sm text-foreground focus:bg-card transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={handleModeSwitch} className="text-primary font-semibold hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
