import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as authApi from "@/lib/authApi";

export type UserRole = "student" | "faculty" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<string | null>;
  registerStudent: (
    name: string,
    email: string,
    password: string,
    department: string,
    semester: number
  ) => Promise<string | null>;
  registerFaculty: (
    name: string,
    email: string,
    password: string,
    department: string
  ) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: false,
  login: async () => null,
  registerStudent: async () => null,
  registerFaculty: async () => null,
  logout: () => {},
});

function mapRole(userType: string): UserRole {
  switch (userType.toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "FACULTY":
      return "faculty";
    default:
      return "student";
  }
}

function parseError(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string } } })
      .response;
    if (resp?.data?.message) return resp.data.message;
  }
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("exam_user");
    const token = localStorage.getItem("exam_token");
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        return { ...parsed, token };
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const saveUser = useCallback((loginRes: authApi.LoginResponse) => {
    const u: User = {
      id: loginRes.userId,
      name: loginRes.name,
      email: loginRes.email,
      role: mapRole(loginRes.userType),
      token: loginRes.token,
    };
    localStorage.setItem("exam_token", loginRes.token);
    localStorage.setItem(
      "exam_user",
      JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role })
    );
    setUser(u);
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole
    ): Promise<string | null> => {
      setLoading(true);
      try {
        const res = await authApi.login({
          email,
          password,
          userType: role.toUpperCase() as "ADMIN" | "FACULTY" | "STUDENT",
        });
        saveUser(res);
        return null; // no error
      } catch (err) {
        return parseError(err);
      } finally {
        setLoading(false);
      }
    },
    [saveUser]
  );

  const registerStudent = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      department: string,
      semester: number
    ): Promise<string | null> => {
      setLoading(true);
      try {
        const res = await authApi.registerStudent({
          name,
          email,
          password,
          department,
          semester,
        });
        saveUser(res);
        return null;
      } catch (err) {
        return parseError(err);
      } finally {
        setLoading(false);
      }
    },
    [saveUser]
  );

  const registerFaculty = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      department: string
    ): Promise<string | null> => {
      setLoading(true);
      try {
        const res = await authApi.registerFaculty({
          name,
          email,
          password,
          department,
        });
        saveUser(res);
        return null;
      } catch (err) {
        return parseError(err);
      } finally {
        setLoading(false);
      }
    },
    [saveUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("exam_token");
    localStorage.removeItem("exam_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registerStudent, registerFaculty, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
