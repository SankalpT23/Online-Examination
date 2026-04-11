package com.examination.OnlineExamination.service;

import com.examination.OnlineExamination.dto.responses.ExamReportResponse;
import com.examination.OnlineExamination.dto.responses.LeaderBoardResponse;
import com.examination.OnlineExamination.dto.responses.ResultResponse;
import com.examination.OnlineExamination.enums.AttemptStatus;
import com.examination.OnlineExamination.exception.ResourceNotFoundException;
import com.examination.OnlineExamination.model.ExamAttempt;
import com.examination.OnlineExamination.model.Result;
import com.examination.OnlineExamination.repository.ResultRepository;
import com.examination.OnlineExamination.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository resultRepository;
    private final ExamService examService;

    @Value("${exam.pass.percentage}")
    private double passPercentage;

    // ──────────────────────────────────────────────────────
    // GENERATE RESULT — Called after submit (internal use)
    // Auto-creates Result from a submitted attempt
    // ──────────────────────────────────────────────────────
    @Transactional
    public Result generateResult(ExamAttempt attempt) {
        // Don't duplicate
        if (resultRepository.existsByAttempt_AttemptId(attempt.getAttemptId())) {
            return resultRepository.findByAttempt_AttemptId(attempt.getAttemptId()).get();
        }

        double percentage = (attempt.getScore() * 100.0) /
                attempt.getExam().getTotalMarks();
        String grade = calculateGrade(percentage);

        Result result = Result.builder()
                .attempt(attempt)
                .student(attempt.getStudent())
                .exam(attempt.getExam())
                .totalScore(attempt.getScore())
                .grade(grade)
                .build();

        return resultRepository.save(result);
    }

    // ──────────────────────────────────────────────────────
    // GET MY RESULTS — Student sees all their results
    // ──────────────────────────────────────────────────────
    public List<ResultResponse> getMyResults(UserPrincipal principal) {
        return resultRepository.findByStudent_StudentId(principal.getUserId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ──────────────────────────────────────────────────────
    // GET RESULT BY ATTEMPT — Student views one result
    // ──────────────────────────────────────────────────────
    public ResultResponse getResultByAttempt(Long attemptId, UserPrincipal principal) {
        Result result = resultRepository.findByAttempt_AttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Result not found for attempt: " + attemptId));

        // Student can only view their own result
        if (!result.getStudent().getStudentId().equals(principal.getUserId())) {
            throw new RuntimeException("You do not have permission to view this result.");
        }

        return mapToResponse(result);
    }

    // ──────────────────────────────────────────────────────
    // GET RESULTS BY EXAM — Faculty/Admin sees all
    // ──────────────────────────────────────────────────────
    public List<ResultResponse> getResultsByExam(Long examId) {
        examService.findExamById(examId);
        return resultRepository.findByExam_ExamIdOrderByTotalScoreDesc(examId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ──────────────────────────────────────────────────────
    // LEADERBOARD — Ranked list for an exam
    // ──────────────────────────────────────────────────────
    public List<LeaderBoardResponse> getLeaderboard(Long examId) {
        examService.findExamById(examId);
        List<Result> results = resultRepository.findByExam_ExamIdOrderByTotalScoreDesc(examId);

        AtomicInteger rank = new AtomicInteger(1);
        List<LeaderBoardResponse> leaderboard = new ArrayList<>();

        for (Result r : results) {
            double percentage = (r.getTotalScore() * 100.0) / r.getExam().getTotalMarks();
            leaderboard.add(LeaderBoardResponse.builder()
                    .rank(rank.getAndIncrement())
                    .studentId(r.getStudent().getStudentId())
                    .studentName(r.getStudent().getName())
                    .department(r.getStudent().getDepartment())
                    .semester(r.getStudent().getSemester())
                    .score(r.getTotalScore())
                    .totalMarks(r.getExam().getTotalMarks())
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .grade(r.getGrade())
                    .build());
        }
        return leaderboard;
    }

    // ──────────────────────────────────────────────────────
    // EXAM-WISE REPORT — Admin/Faculty analytics
    // ──────────────────────────────────────────────────────
    public List<ExamReportResponse> getExamWiseReport() {
        List<Object[]> rawData = resultRepository.findExamWiseReport();
        List<ExamReportResponse> report = new ArrayList<>();

        for (Object[] row : rawData) {
            Long examId        = ((Number) row[0]).longValue();
            String examName    = (String) row[1];
            Long totalAttempts = ((Number) row[2]).longValue();
            Double avgScore    = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            Integer highest    = row[4] != null ? ((Number) row[4]).intValue() : 0;
            Integer lowest     = row[5] != null ? ((Number) row[5]).intValue() : 0;

            long passed = resultRepository.countPassedByExam(examId, passPercentage);
            long failed = totalAttempts - passed;

            double passPercent = totalAttempts > 0
                    ? Math.round((passed * 100.0 / totalAttempts) * 100.0) / 100.0
                    : 0.0;

            report.add(ExamReportResponse.builder()
                    .examId(examId)
                    .examName(examName)
                    .totalAttempts(totalAttempts)
                    .averageScore(Math.round(avgScore * 100.0) / 100.0)
                    .highestScore(highest)
                    .lowestScore(lowest)
                    .passedCount(passed)
                    .failedCount(failed)
                    .passPercentage(passPercent)
                    .build());
        }
        return report;
    }

    // ──────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────
    private String calculateGrade(double percentage) {
        if (percentage >= 90) return "A";
        if (percentage >= 80) return "B";
        if (percentage >= 70) return "C";
        if (percentage >= 60) return "D";
        return "F";
    }

    private ResultResponse mapToResponse(Result r) {
        double percentage = (r.getTotalScore() * 100.0) / r.getExam().getTotalMarks();
        boolean passed = percentage >= passPercentage;

        return ResultResponse.builder()
                .resultId(r.getResultId())
                .attemptId(r.getAttempt().getAttemptId())
                .studentId(r.getStudent().getStudentId())
                .studentName(r.getStudent().getName())
                .examId(r.getExam().getExamId())
                .examName(r.getExam().getExamName())
                .subjectName(r.getExam().getSubject().getSubjectName())
                .totalScore(r.getTotalScore())
                .totalMarks(r.getExam().getTotalMarks())
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .grade(r.getGrade())
                .result(passed ? "PASS" : "FAIL")
                .resultDate(r.getResultDate())
                .build();
    }
}
