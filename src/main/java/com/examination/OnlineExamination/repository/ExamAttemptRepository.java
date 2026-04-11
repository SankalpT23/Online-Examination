package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.enums.AttemptStatus;
import com.examination.OnlineExamination.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    boolean existsByStudent_StudentIdAndExam_ExamId(Long studentId, Long examId);

    Optional<ExamAttempt> findByStudent_StudentIdAndExam_ExamId(Long studentId, Long examId);

    List<ExamAttempt> findByStudent_StudentId(Long studentId);

    List<ExamAttempt> findByExam_ExamId(Long examId);

    List<ExamAttempt> findByExam_ExamIdAndStatus(Long examId, AttemptStatus status);

    long countByStudent_StudentId(Long studentId);

    // Total submitted attempts across all exams
    @Query("SELECT COUNT(a) FROM ExamAttempt a WHERE a.status = 'SUBMITTED'")
    long countAllSubmitted();
}
