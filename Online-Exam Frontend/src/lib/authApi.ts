import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
  userType: "ADMIN" | "FACULTY" | "STUDENT";
}

export interface StudentRegisterRequest {
  name: string;
  email: string;
  password: string;
  department: string;
  semester: number;
}

export interface FacultyRegisterRequest {
  name: string;
  email: string;
  password: string;
  department: string;
}

export interface LoginResponse {
  token: string;
  userType: string;
  userId: number;
  name: string;
  email: string;
  message: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function registerStudent(
  data: StudentRegisterRequest
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/register/student", data);
  return res.data;
}

export async function registerFaculty(
  data: FacultyRegisterRequest
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/register/faculty", data);
  return res.data;
}
