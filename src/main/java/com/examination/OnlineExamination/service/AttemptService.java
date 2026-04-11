package com.examination.OnlineExamination.service;

import com.examination.OnlineExamination.dto.requests.SubmitAnswerRequest;
import com.examination.OnlineExamination.dto.responses.AttemptResponse;
import com.examination.OnlineExamination.enums.AttemptStatus;
import com.examination.OnlineExamination.enums.ExamStatus;
import com.examination.OnlineExamination.exception.DuplicateAttemptException;
import com.examination.OnlineExamination.exception.ExamNotAvailableException;
import com.examination.OnlineExamination.exception.ResourceNotFoundException;
import com.examination.OnlineExamination.model.*;
import com.examination.OnlineExamination.repository.*;
import com.examination.OnlineExamination.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttemptService {

    @Value("${exam.pass.percentage}")
    private double passPercentage;

    private final ExamAttemptRepository attemptRepository;
    private final StudentAnswerRepository answerRepository;
    private final StudentRepository studentRepository;
    private final QuestionRepository questionRepository;
    private final EnrollmentService enrollmentService;
    private final ExamService examService;
    private final ResultService resultService;
    private final EmailService emailService;

    // ──────────────────────────────────────────────────────
    // START ATTEMPT — Student starts the exam
    // ──────────────────────────────────────────────────────
    @Transactional
    public AttemptResponse startAttempt(Long examId, UserPrincipal principal) {
        Exam exam = examService.findExamById(examId);

        // Must be PUBLISHED
        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new ExamNotAvailableException(
                    "Exam is not available. Current status: " + exam.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();

        // Must be within exam time window
        if (now.isBefore(exam.getStartTime())) {
            throw new ExamNotAvailableException(
                    "Exam has not started yet. It starts at: " + exam.getStartTime());
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new ExamNotAvailableException(
                    "Exam time window has closed.");
        }

        // Must be enrolled
        if (!enrollmentService.isEnrolled(principal.getUserId(), examId)) {
            throw new ExamNotAvailableException(
                    "You are not enrolled in this exam. Please enroll first.");
        }

        // No duplicate attempt
        if (attemptRepository.existsByStudent_StudentIdAndExam_ExamId(
                principal.getUserId(), examId)) {
            throw new DuplicateAttemptException(
                    "You have already attempted this exam.");
        }

        Student student = studentRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found: " + principal.getUserId()));

        ExamAttempt attempt = ExamAttempt.builder()
                .student(student)
                .exam(exam)
                .startTime(now)
                .score(0)
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        ExamAttempt saved = attemptRepository.save(attempt);
        return mapToResponse(saved, "Exam started! Good luck.");
    }

    // ──────────────────────────────────────────────────────
    // SUBMIT ATTEMPT — Student submits answers → AUTO GRADE
    // ──────────────────────────────────────────────────────
    @Transactional
    public AttemptResponse submitAttempt(Long attemptId,
                                         SubmitAnswerRequest request,
                                         UserPrincipal principal) {

        ExamAttempt attempt = findAttemptById(attemptId);

        // Only the owner can submit
        if (!attempt.getStudent().getStudentId().equals(principal.getUserId())) {
            throw new RuntimeException("You do not have permission to submit this attempt.");
        }

        // Can't re-submit
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException(
                    "This attempt is already " + attempt.getStatus() + ". Cannot re-submit.");
        }

        // Check if time has expired → mark as TIMED_OUT
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = attempt.getStartTime()
                .plusMinutes(attempt.getExam().getDurationMins());

        AttemptStatus finalStatus = now.isAfter(deadline)
                ? AttemptStatus.TIMED_OUT
                : AttemptStatus.SUBMITTED;

        // ── AUTO-GRADING ──────────────────────────────────
        int totalScore = 0;
        List<StudentAnswer> answersToSave = new ArrayList<>();

        for (SubmitAnswerRequest.AnswerItem item : request.getAnswers()) {

            Question question = questionRepository.findById(item.getQuestionId())
                    .orElse(null);

            // Skip invalid question IDs silently
            if (question == null) continue;

            // Check question belongs to this exam
            if (!question.getExam().getExamId().equals(attempt.getExam().getExamId())) {
                continue;
            }

            // Skip if already answered (prevent duplicates in same submission)
            if (answerRepository.existsByAttempt_AttemptIdAndQuestion_QuestionId(
                    attemptId, item.getQuestionId())) {
                continue;
            }

            // Check if answer is correct
            if (item.getSelectedOption() != null &&
                    item.getSelectedOption() == question.getCorrectOption()) {
                totalScore += question.getMarks();
            }

            StudentAnswer studentAnswer = StudentAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(item.getSelectedOption())
                    .build();

            answersToSave.add(studentAnswer);
        }

        answerRepository.saveAll(answersToSave);

        // ── UPDATE ATTEMPT ────────────────────────────────
        attempt.setScore(totalScore);
        attempt.setStatus(finalStatus);
        attempt.setSubmitTime(now);

        ExamAttempt submitted = attemptRepository.save(attempt);

        String message = finalStatus == AttemptStatus.TIMED_OUT
                ? "Time's up! Your answers have been auto-submitted. Score: " + totalScore
                : "Exam submitted successfully! Your score: " + totalScore
                + "/" + attempt.getExam().getTotalMarks();
        if (finalStatus == AttemptStatus.SUBMITTED || finalStatus == AttemptStatus.TIMED_OUT) {
            Result generatedResult = resultService.generateResult(submitted);

            // Send result email (async)
            double pct = (submitted.getScore() * 100.0) /
                    submitted.getExam().getTotalMarks();
            boolean passed = pct >= passPercentage;

            emailService.sendResultEmail(
                    submitted.getStudent().getEmail(),
                    submitted.getStudent().getName(),
                    submitted.getExam().getExamName(),
                    submitted.getExam().getSubject().getSubjectName(),
                    submitted.getScore(),
                    submitted.getExam().getTotalMarks(),
                    Math.round(pct * 100.0) / 100.0,
                    generatedResult.getGrade(),
                    passed ? "PASS" : "FAIL"
            );
        }

        return mapToResponse(submitted, message);
    }

    // ──────────────────────────────────────────────────────
    // GET MY ATTEMPTS — Student sees their own attempts
    // ──────────────────────────────────────────────────────
    public List<AttemptResponse> getMyAttempts(UserPrincipal principal) {
        return attemptRepository.findByStudent_StudentId(principal.getUserId())
                .stream()
                .map(a -> mapToResponse(a, null))
                .toList();
    }

    // ──────────────────────────────────────────────────────
    // GET ATTEMPTS BY EXAM — Faculty/Admin
    // ──────────────────────────────────────────────────────
    public List<AttemptResponse> getAttemptsByExam(Long examId) {
        examService.findExamById(examId); // verify exists
        return attemptRepository.findByExam_ExamId(examId)
                .stream()
                .map(a -> mapToResponse(a, null))
                .toList();
    }

    // ──────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────
    public ExamAttempt findAttemptById(Long attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attempt not found with id: " + attemptId));
    }

    private AttemptResponse mapToResponse(ExamAttempt a, String message) {
        return AttemptResponse.builder()
                .attemptId(a.getAttemptId())
                .studentId(a.getStudent().getStudentId())
                .studentName(a.getStudent().getName())
                .examId(a.getExam().getExamId())
                .examName(a.getExam().getExamName())
                .durationMins(a.getExam().getDurationMins())
                .startTime(a.getStartTime())
                .submitTime(a.getSubmitTime())
                .examEndTime(a.getExam().getEndTime())
                .score(a.getScore())
                .totalMarks(a.getExam().getTotalMarks())
                .status(a.getStatus())
                .message(message)
                .build();
    }
}
