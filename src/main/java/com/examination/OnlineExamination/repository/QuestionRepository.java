package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExam_ExamId(Long examId);

    long countByExam_ExamId(Long examId);

    // Check if question belongs to a specific exam (ownership validation)
    boolean existsByQuestionIdAndExam_Faculty_FacultyId(
            Long questionId, Long facultyId);
}
