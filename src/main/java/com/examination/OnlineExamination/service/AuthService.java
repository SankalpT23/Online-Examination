package com.examination.OnlineExamination.service;

import com.examination.OnlineExamination.dto.requests.FacultyRegisterRequest;
import com.examination.OnlineExamination.dto.requests.LoginRequest;
import com.examination.OnlineExamination.dto.requests.StudentRegisterRequest;
import com.examination.OnlineExamination.dto.responses.LoginResponse;
import com.examination.OnlineExamination.enums.UserType;
import com.examination.OnlineExamination.model.Admin;
import com.examination.OnlineExamination.model.Faculty;
import com.examination.OnlineExamination.model.Student;
import com.examination.OnlineExamination.repository.AdminRepository;
import com.examination.OnlineExamination.repository.FacultyRepository;
import com.examination.OnlineExamination.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    // ──────────────────────────────────────────
    // FACULTY REGISTER
    // ──────────────────────────────────────────
    public LoginResponse registerFaculty(FacultyRegisterRequest request) {
        if (facultyRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered as faculty");
        }

        Faculty faculty = Faculty.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .department(request.getDepartment())
                .build();

        Faculty saved = facultyRepository.save(faculty);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), "FACULTY");
        String token = jwtService.generateToken(saved.getEmail(), UserType.FACULTY, saved.getFacultyId());

        return LoginResponse.builder()
                .token(token)
                .userType(UserType.FACULTY.name())
                .userId(saved.getFacultyId())
                .name(saved.getName())
                .email(saved.getEmail())
                .message("Faculty registered successfully")
                .build();
    }

    // ──────────────────────────────────────────
    // STUDENT REGISTER
    // ──────────────────────────────────────────
    public LoginResponse registerStudent(StudentRegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered as student");
        }

        Student student = Student.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .department(request.getDepartment())
                .semester(request.getSemester())
                .build();

        Student saved = studentRepository.save(student);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), "STUDENT");
        String token = jwtService.generateToken(saved.getEmail(), UserType.STUDENT, saved.getStudentId());

        return LoginResponse.builder()
                .token(token)
                .userType(UserType.STUDENT.name())
                .userId(saved.getStudentId())
                .name(saved.getName())
                .email(saved.getEmail())
                .message("Student registered successfully")
                .build();
    }

    // ──────────────────────────────────────────
    // UNIFIED LOGIN (Admin + Faculty + Student)
    // ──────────────────────────────────────────
    public LoginResponse login(LoginRequest request) {
        return switch (request.getUserType()) {
            case ADMIN   -> loginAdmin(request);
            case FACULTY -> loginFaculty(request);
            case STUDENT -> loginStudent(request);
        };
    }

    // ──────────────────────────────────────────
    // Private login helpers
    // ──────────────────────────────────────────
    private LoginResponse loginAdmin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(admin.getEmail(), UserType.ADMIN, admin.getAdminId());

        return LoginResponse.builder()
                .token(token)
                .userType(UserType.ADMIN.name())
                .userId(admin.getAdminId())
                .name(admin.getName())
                .email(admin.getEmail())
                .message("Login successful")
                .build();
    }

    private LoginResponse loginFaculty(LoginRequest request) {
        Faculty faculty = facultyRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), faculty.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(faculty.getEmail(), UserType.FACULTY, faculty.getFacultyId());

        return LoginResponse.builder()
                .token(token)
                .userType(UserType.FACULTY.name())
                .userId(faculty.getFacultyId())
                .name(faculty.getName())
                .email(faculty.getEmail())
                .message("Login successful")
                .build();
    }

    private LoginResponse loginStudent(LoginRequest request) {
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(student.getEmail(), UserType.STUDENT, student.getStudentId());

        return LoginResponse.builder()
                .token(token)
                .userType(UserType.STUDENT.name())
                .userId(student.getStudentId())
                .name(student.getName())
                .email(student.getEmail())
                .message("Login successful")
                .build();
    }
}
