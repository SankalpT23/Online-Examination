package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.requests.ExamRequest;
import com.examination.OnlineExamination.dto.responses.ExamResponse;
import com.examination.OnlineExamination.security.UserPrincipal;
import com.examination.OnlineExamination.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;

    // POST /exams — FACULTY only
    @PostMapping
    public ResponseEntity<ExamResponse> create(
            @Valid @RequestBody ExamRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(examService.createExam(request, principal));
    }

    // PUT /exams/{id} — FACULTY only (own exam)
    @PutMapping("/{id}")
    public ResponseEntity<ExamResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ExamRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.updateExam(id, request, principal));
    }

    // DELETE /exams/{id} — FACULTY only (own exam)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        examService.deleteExam(id, principal);
        return ResponseEntity.noContent().build();
    }

    // PUT /exams/{id}/publish — FACULTY only → DRAFT to PUBLISHED
    @PutMapping("/{id}/publish")
    public ResponseEntity<ExamResponse> publish(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.publishExam(id, principal));
    }

    // PUT /exams/{id}/close — FACULTY only → PUBLISHED to CLOSED
    @PutMapping("/{id}/close")
    public ResponseEntity<ExamResponse> close(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.closeExam(id, principal));
    }

    // GET /exams — role-based: ADMIN=all, FACULTY=own, STUDENT=published
    @GetMapping
    public ResponseEntity<List<ExamResponse>> getAll(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.getExams(principal));
    }

    // GET /exams/{id} — all authenticated
    @GetMapping("/{id}")
    public ResponseEntity<ExamResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }
}
