package com.examination.OnlineExamination.service;

import com.examination.OnlineExamination.dto.requests.QuestionRequest;
import com.examination.OnlineExamination.dto.responses.QuestionResponse;
import com.examination.OnlineExamination.enums.ExamStatus;
import com.examination.OnlineExamination.enums.UserType;
import com.examination.OnlineExamination.exception.ResourceNotFoundException;
import com.examination.OnlineExamination.model.Exam;
import com.examination.OnlineExamination.model.Question;
import com.examination.OnlineExamination.repository.QuestionRepository;
import com.examination.OnlineExamination.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamService examService;

    // ──────────────────────────────────────────────────────
    // ADD QUESTION — Faculty only, must own the exam
    // ──────────────────────────────────────────────────────
    @Transactional
    public QuestionResponse addQuestion(Long examId,
                                        QuestionRequest request,
                                        UserPrincipal principal) {
        Exam exam = examService.findExamById(examId);

        // Ownership check — faculty can only add to their own exam
        if (!exam.getFaculty().getFacultyId().equals(principal.getUserId())) {
            throw new RuntimeException(
                    "You do not have permission to add questions to this exam");
        }

        // Can't add questions to a CLOSED exam
        if (exam.getStatus() == ExamStatus.CLOSED) {
            throw new RuntimeException(
                    "Cannot add questions to a CLOSED exam");
        }

        Question question = Question.builder()
                .exam(exam)
                .questionText(request.getQuestionText())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctOption(request.getCorrectOption())
                .marks(request.getMarks() != null ? request.getMarks() : 1)
                .build();

        return mapToResponse(questionRepository.save(question), false);
    }

    // ──────────────────────────────────────────────────────
    // DELETE QUESTION — Faculty only, must own the exam
    // ──────────────────────────────────────────────────────
    @Transactional
    public void deleteQuestion(Long questionId, UserPrincipal principal) {
        Question question = findQuestionById(questionId);

        // Check faculty owns the exam this question belongs to
        if (!question.getExam().getFaculty().getFacultyId().equals(principal.getUserId())) {
            throw new RuntimeException(
                    "You do not have permission to delete this question");
        }

        questionRepository.delete(question);
    }

    // ──────────────────────────────────────────────────────
    // GET QUESTIONS FOR EXAM — role-based correctOption visibility
    //   STUDENT        → correctOption hidden (null)
    //   FACULTY, ADMIN → correctOption visible
    // ──────────────────────────────────────────────────────
    public List<QuestionResponse> getQuestionsByExam(Long examId,
                                                     UserPrincipal principal) {
        // Verify exam exists
        examService.findExamById(examId);

        boolean hideAnswer = (principal.getUserType() == UserType.STUDENT);

        return questionRepository.findByExam_ExamId(examId)
                .stream()
                .map(q -> mapToResponse(q, hideAnswer))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────
    // GET QUESTION COUNT FOR EXAM
    // ──────────────────────────────────────────────────────
    public long getQuestionCount(Long examId) {
        return questionRepository.countByExam_ExamId(examId);
    }

    // ──────────────────────────────────────────────────────
    // Internal helpers — used by AttemptService (Day 5)
    // ──────────────────────────────────────────────────────
    public Question findQuestionById(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + questionId));
    }

    private QuestionResponse mapToResponse(Question question, boolean hideAnswer) {
        return QuestionResponse.builder()
                .questionId(question.getQuestionId())
                .examId(question.getExam().getExamId())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .correctOption(hideAnswer ? null : question.getCorrectOption())
                .marks(question.getMarks())
                .build();
    }
}
