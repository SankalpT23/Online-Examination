package com.examination.OnlineExamination.repository;


import com.examination.OnlineExamination.model.ExamEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamEnrollmentRepository extends JpaRepository<ExamEnrollment, Long> {

    boolean existsByStudent_StudentIdAndExam_ExamId(
            Long studentId, Long examId);

    List<ExamEnrollment> findByStudent_StudentId(Long studentId);

    List<ExamEnrollment> findByExam_ExamId(Long examId);

    long countByExam_ExamId(Long examId);

    Optional<ExamEnrollment> findByStudent_StudentIdAndExam_ExamId(
            Long studentId, Long examId);

}
