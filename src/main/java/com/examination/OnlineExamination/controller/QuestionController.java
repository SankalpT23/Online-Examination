package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.requests.QuestionRequest;
import com.examination.OnlineExamination.dto.responses.QuestionResponse;
import com.examination.OnlineExamination.security.UserPrincipal;
import com.examination.OnlineExamination.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // POST /exams/{examId}/questions — FACULTY only
    @PostMapping("/exams/{examId}/questions")
    public ResponseEntity<QuestionResponse> addQuestion(
            @PathVariable Long examId,
            @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.addQuestion(examId, request, principal));
    }

    // GET /exams/{examId}/questions — all authenticated (correctOption hidden for STUDENT)
    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestions(
            @PathVariable Long examId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                questionService.getQuestionsByExam(examId, principal));
    }

    // GET /exams/{examId}/questions/count — all authenticated
    @GetMapping("/exams/{examId}/questions/count")
    public ResponseEntity<Map<String, Long>> getCount(
            @PathVariable Long examId) {
        return ResponseEntity.ok(
                Map.of("totalQuestions", questionService.getQuestionCount(examId)));
    }

    // DELETE /questions/{id} — FACULTY only
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        questionService.deleteQuestion(id, principal);
        return ResponseEntity.noContent().build();
    }
}
