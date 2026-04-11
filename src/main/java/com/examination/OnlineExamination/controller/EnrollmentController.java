package com.examination.OnlineExamination.controller;


import com.examination.OnlineExamination.dto.requests.EnrollmentRequest;
import com.examination.OnlineExamination.dto.responses.EnrollmentResponse;
import com.examination.OnlineExamination.security.UserPrincipal;
import com.examination.OnlineExamination.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // POST /enrollments — STUDENT only
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(
            @Valid @RequestBody EnrollmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enroll(request, principal));
    }

    // DELETE /enrollments/{id} — STUDENT only (before exam starts)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unenroll(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        enrollmentService.unenroll(id, principal);
        return ResponseEntity.noContent().build();
    }

    // GET /enrollments/my — STUDENT only
    @GetMapping("/my")
    public ResponseEntity<List<EnrollmentResponse>> myEnrollments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(principal));
    }

    // GET /enrollments/exam/{examId} — FACULTY + ADMIN
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<EnrollmentResponse>> byExam(
            @PathVariable Long examId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByExam(examId));
    }

    // GET /enrollments/exam/{examId}/count — FACULTY + ADMIN
    @GetMapping("/exam/{examId}/count")
    public ResponseEntity<Map<String, Long>> count(
            @PathVariable Long examId) {
        return ResponseEntity.ok(
                Map.of("enrolledCount", enrollmentService.getEnrollmentCount(examId)));
    }
}
