package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.requests.SubmitAnswerRequest;
import com.examination.OnlineExamination.dto.responses.AttemptResponse;
import com.examination.OnlineExamination.security.UserPrincipal;
import com.examination.OnlineExamination.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    // POST /attempts/start/{examId} — STUDENT only
    @PostMapping("/start/{examId}")
    public ResponseEntity<AttemptResponse> start(
            @PathVariable Long examId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attemptService.startAttempt(examId, principal));
    }

    // POST /attempts/submit/{attemptId} — STUDENT only
    @PostMapping("/submit/{attemptId}")
    public ResponseEntity<AttemptResponse> submit(
            @PathVariable Long attemptId,
            @Valid @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attemptService.submitAttempt(attemptId, request, principal));
    }

    // GET /attempts/my — STUDENT — see own attempts
    @GetMapping("/my")
    public ResponseEntity<List<AttemptResponse>> myAttempts(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attemptService.getMyAttempts(principal));
    }

    // GET /attempts/exam/{examId} — FACULTY + ADMIN
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<AttemptResponse>> byExam(@PathVariable Long examId) {
        return ResponseEntity.ok(attemptService.getAttemptsByExam(examId));
    }
}
