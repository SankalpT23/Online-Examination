package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.requests.FacultyRegisterRequest;
import com.examination.OnlineExamination.dto.requests.LoginRequest;
import com.examination.OnlineExamination.dto.requests.StudentRegisterRequest;
import com.examination.OnlineExamination.dto.responses.LoginResponse;
import com.examination.OnlineExamination.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    // POST /auth/register/faculty
    @PostMapping("/register/faculty")
    public ResponseEntity<LoginResponse> registerFaculty(
            @Valid @RequestBody FacultyRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerFaculty(request));
    }

    // POST /auth/register/student
    @PostMapping("/register/student")
    public ResponseEntity<LoginResponse> registerStudent(
            @Valid @RequestBody StudentRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerStudent(request));
    }

    // POST /auth/login  (Admin + Faculty + Student — same endpoint, userType in body)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
