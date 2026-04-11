package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.responses.*;
import com.examination.OnlineExamination.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    // GET /admin/dashboard — ADMIN only
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // GET /admin/students — ADMIN only
    @GetMapping("/students")
    public ResponseEntity<List<StudentSummaryResponse>> students() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    // GET /admin/faculty — ADMIN only
    @GetMapping("/faculty")
    public ResponseEntity<List<FacultySummaryResponse>> faculty() {
        return ResponseEntity.ok(adminService.getAllFaculty());
    }

    // GET /admin/weak-questions/{examId} — ADMIN only
    @GetMapping("/weak-questions/{examId}")
    public ResponseEntity<List<WeakQuestionResponse>> weakQuestions(
            @PathVariable Long examId) {
        return ResponseEntity.ok(adminService.getWeakQuestions(examId));
    }
}
