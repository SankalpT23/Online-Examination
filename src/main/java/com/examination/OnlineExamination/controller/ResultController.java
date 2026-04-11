package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.responses.ExamReportResponse;
import com.examination.OnlineExamination.dto.responses.LeaderBoardResponse;
import com.examination.OnlineExamination.dto.responses.ResultResponse;
import com.examination.OnlineExamination.security.UserPrincipal;
import com.examination.OnlineExamination.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    // GET /results/my — STUDENT only
    @GetMapping("/my")
    public ResponseEntity<List<ResultResponse>> myResults(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resultService.getMyResults(principal));
    }

    // GET /results/attempt/{attemptId} — STUDENT (own only)
    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<ResultResponse> byAttempt(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resultService.getResultByAttempt(attemptId, principal));
    }

    // GET /results/exam/{examId} — FACULTY + ADMIN
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<ResultResponse>> byExam(
            @PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getResultsByExam(examId));
    }

    // GET /results/leaderboard/{examId} — All authenticated
    @GetMapping("/leaderboard/{examId}")
    public ResponseEntity<List<LeaderBoardResponse>> leaderboard(
            @PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getLeaderboard(examId));
    }

    // GET /results/report — FACULTY + ADMIN
    @GetMapping("/report")
    public ResponseEntity<List<ExamReportResponse>> report() {
        return ResponseEntity.ok(resultService.getExamWiseReport());
    }

}
