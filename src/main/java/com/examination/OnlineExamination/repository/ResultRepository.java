package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends  JpaRepository<Result, Long> {

    List<Result> findByStudent_StudentId(Long studentId);

    List<Result> findByExam_ExamIdOrderByTotalScoreDesc(Long examId);

    Optional<Result> findByAttempt_AttemptId(Long attemptId);

    boolean existsByAttempt_AttemptId(Long attemptId);

    // For report: exam-wise aggregate stats
    @Query("SELECT r.exam.examId, r.exam.examName, " +
            "COUNT(r), AVG(r.totalScore), MAX(r.totalScore), MIN(r.totalScore) " +
            "FROM Result r GROUP BY r.exam.examId, r.exam.examName")
    List<Object[]> findExamWiseReport();

    // Pass count per exam (pass = score >= passPercentage% of totalMarks)
    @Query("SELECT COUNT(r) FROM Result r " +
            "WHERE r.exam.examId = :examId " +
            "AND (r.totalScore * 100.0 / r.exam.totalMarks) >= :passPercentage")
    long countPassedByExam(@Param("examId") Long examId,
                           @Param("passPercentage") double passPercentage);
}
