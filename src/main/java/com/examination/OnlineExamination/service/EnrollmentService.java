package com.examination.OnlineExamination.service;


import com.examination.OnlineExamination.dto.requests.EnrollmentRequest;
import com.examination.OnlineExamination.dto.responses.EnrollmentResponse;
import com.examination.OnlineExamination.enums.ExamStatus;
import com.examination.OnlineExamination.exception.DuplicateEnrollmentException;
import com.examination.OnlineExamination.exception.ExamNotAvailableException;
import com.examination.OnlineExamination.exception.ResourceNotFoundException;
import com.examination.OnlineExamination.model.Exam;
import com.examination.OnlineExamination.model.ExamEnrollment;
import com.examination.OnlineExamination.model.Student;
import com.examination.OnlineExamination.repository.ExamEnrollmentRepository;
import com.examination.OnlineExamination.repository.StudentRepository;
import com.examination.OnlineExamination.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final ExamEnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ExamService examService;

    // ──────────────────────────────────────────────────────
    // ENROLL — Student enrolls in a published exam
    // ──────────────────────────────────────────────────────
    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request, UserPrincipal principal) {
        Exam exam = examService.findExamById(request.getExamId());

        // Exam must be PUBLISHED
        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new ExamNotAvailableException(
                    "Enrollment is only allowed for PUBLISHED exams. " +
                            "Current status: " + exam.getStatus());
        }

        // Can't enroll after exam has already started
        if (LocalDateTime.now().isAfter(exam.getStartTime())) {
            throw new ExamNotAvailableException(
                    "Enrollment closed. This exam has already started.");
        }

        // Duplicate enrollment check
        if (enrollmentRepository.existsByStudent_StudentIdAndExam_ExamId(
                principal.getUserId(), exam.getExamId())) {
            throw new DuplicateEnrollmentException(
                    "You are already enrolled in this exam.");
        }

        Student student = studentRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id: " + principal.getUserId()));

        ExamEnrollment enrollment = ExamEnrollment.builder()
                .student(student)
                .exam(exam)
                .build();

        return mapToResponse(enrollmentRepository.save(enrollment));
    }

    // ──────────────────────────────────────────────────────
    // UNENROLL — Student cancels enrollment before exam starts
    // ──────────────────────────────────────────────────────
    @Transactional
    public void unenroll(Long enrollmentId, UserPrincipal principal) {
        ExamEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Enrollment not found with id: " + enrollmentId));

        // Student can only cancel their own enrollment
        if (!enrollment.getStudent().getStudentId().equals(principal.getUserId())) {
            throw new RuntimeException(
                    "You do not have permission to cancel this enrollment.");
        }

        // Can't unenroll after exam has started
        if (LocalDateTime.now().isAfter(enrollment.getExam().getStartTime())) {
            throw new RuntimeException(
                    "Cannot unenroll after the exam has started.");
        }

        enrollmentRepository.delete(enrollment);
    }

    // ──────────────────────────────────────────────────────
    // GET MY ENROLLMENTS — Student sees their own
    // ──────────────────────────────────────────────────────
    public List<EnrollmentResponse> getMyEnrollments(UserPrincipal principal) {
        return enrollmentRepository
                .findByStudent_StudentId(principal.getUserId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────
    // GET BY EXAM — Faculty / Admin sees all enrolled students
    // ──────────────────────────────────────────────────────
    public List<EnrollmentResponse> getEnrollmentsByExam(Long examId) {
        examService.findExamById(examId); // verify exam exists
        return enrollmentRepository.findByExam_ExamId(examId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────
    // COUNT — How many students enrolled in an exam
    // ──────────────────────────────────────────────────────
    public long getEnrollmentCount(Long examId) {
        return enrollmentRepository.countByExam_ExamId(examId);
    }

    // ──────────────────────────────────────────────────────
    // Internal helper — used by AttemptService (Day 5)
    // ──────────────────────────────────────────────────────
    public boolean isEnrolled(Long studentId, Long examId) {
        return enrollmentRepository.existsByStudent_StudentIdAndExam_ExamId(
                studentId, examId);
    }

    private EnrollmentResponse mapToResponse(ExamEnrollment e) {
        return EnrollmentResponse.builder()
                .enrollmentId(e.getEnrollmentId())
                .studentId(e.getStudent().getStudentId())
                .studentName(e.getStudent().getName())
                .studentEmail(e.getStudent().getEmail())
                .examId(e.getExam().getExamId())
                .examName(e.getExam().getExamName())
                .subjectName(e.getExam().getSubject().getSubjectName())
                .facultyName(e.getExam().getFaculty().getName())
                .durationMins(e.getExam().getDurationMins())
                .examStartTime(e.getExam().getStartTime())
                .examEndTime(e.getExam().getEndTime())
                .totalMarks(e.getExam().getTotalMarks())
                .examStatus(e.getExam().getStatus())
                .enrolledDate(e.getEnrolledDate())
                .build();
    }
}
