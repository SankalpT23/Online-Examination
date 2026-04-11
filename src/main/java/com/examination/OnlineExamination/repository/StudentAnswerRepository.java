package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.model.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByAttempt_AttemptId(Long attemptId);

    boolean existsByAttempt_AttemptIdAndQuestion_QuestionId(Long attemptId, Long questionId);

    @Query("SELECT sa.question.questionId, " +
            "sa.question.questionText, " +
            "sa.question.correctOption, " +
            "COUNT(sa), " +
            "SUM(CASE WHEN sa.selectedOption = sa.question.correctOption THEN 1 ELSE 0 END) " +
            "FROM StudentAnswer sa " +
            "WHERE sa.question.exam.examId = :examId " +
            "GROUP BY sa.question.questionId, sa.question.questionText, sa.question.correctOption " +
            "ORDER BY SUM(CASE WHEN sa.selectedOption = sa.question.correctOption THEN 1 ELSE 0 END) ASC")
    List<Object[]> findWeakQuestionsByExam(@Param("examId") Long examId);
}
