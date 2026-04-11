package com.examination.OnlineExamination.service;


import com.examination.OnlineExamination.dto.requests.ExamRequest;
import com.examination.OnlineExamination.dto.responses.ExamResponse;
import com.examination.OnlineExamination.enums.ExamStatus;
import com.examination.OnlineExamination.enums.UserType;
import com.examination.OnlineExamination.exception.ResourceNotFoundException;
import com.examination.OnlineExamination.model.Exam;
import com.examination.OnlineExamination.model.Faculty;
import com.examination.OnlineExamination.model.Subject;
import com.examination.OnlineExamination.repository.ExamRepository;
import com.examination.OnlineExamination.repository.FacultyRepository;
import com.examination.OnlineExamination.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectService subjectService;
    private final EmailService emailService;
    @Lazy
    private final EnrollmentService enrollmentService;

    // ──────────────────────────────────────────────────────
    // CREATE — Faculty only, status starts as DRAFT
    // ──────────────────────────────────────────────────────
    @Transactional
    public ExamResponse createExam(ExamRequest request, UserPrincipal principal) {
        validateExamTimes(request);

        Subject subject = subjectService.findSubjectById(request.getSubjectId());

        Faculty faculty = facultyRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Faculty not found with id: " + principal.getUserId()));

        Exam exam = Exam.builder()
                .examName(request.getExamName())
                .subject(subject)
                .faculty(faculty)
                .durationMins(request.getDurationMins())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .totalMarks(request.getTotalMarks())
                .status(ExamStatus.DRAFT)
                .build();

        return mapToResponse(examRepository.save(exam));
    }

    // ──────────────────────────────────────────────────────
    // UPDATE — Faculty can only update their own exams
    // ──────────────────────────────────────────────────────
    @Transactional
    public ExamResponse updateExam(Long examId, ExamRequest request, UserPrincipal principal) {
        validateExamTimes(request);

        Exam exam = getOwnedExam(examId, principal.getUserId());
        Subject subject = subjectService.findSubjectById(request.getSubjectId());

        exam.setExamName(request.getExamName());
        exam.setSubject(subject);
        exam.setDurationMins(request.getDurationMins());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setTotalMarks(request.getTotalMarks());

        return mapToResponse(examRepository.save(exam));
    }

    // ──────────────────────────────────────────────────────
    // DELETE — Faculty can only delete their own DRAFT exams
    // ──────────────────────────────────────────────────────
    @Transactional
    public void deleteExam(Long examId, UserPrincipal principal) {
        Exam exam = getOwnedExam(examId, principal.getUserId());

        if (exam.getStatus() == ExamStatus.PUBLISHED) {
            throw new RuntimeException(
                    "Cannot delete a PUBLISHED exam. Close it first.");
        }

        examRepository.delete(exam);
    }

    // ──────────────────────────────────────────────────────
    // PUBLISH — DRAFT → PUBLISHED
    // ──────────────────────────────────────────────────────
    @Transactional
    public ExamResponse publishExam(Long examId, UserPrincipal principal) {
        Exam exam = getOwnedExam(examId, principal.getUserId());

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new RuntimeException(
                    "Only DRAFT exams can be published. Current status: " + exam.getStatus());
        }

        exam.setStatus(ExamStatus.PUBLISHED);
        Exam saved = examRepository.save(exam);

        // Send notification email to all enrolled students (async)
        String startTime = saved.getStartTime().toString().replace("T", " ");
        String endTime   = saved.getEndTime().toString().replace("T", " ");

        enrollmentService.getEnrollmentsByExam(examId).forEach(enrollment -> {
            emailService.sendExamPublishedEmail(
                    enrollment.getStudentEmail(),
                    enrollment.getStudentName(),
                    saved.getExamName(),
                    saved.getSubject().getSubjectName(),
                    saved.getFaculty().getName(),
                    startTime,
                    endTime,
                    saved.getDurationMins(),
                    saved.getTotalMarks()
            );
        });
        return mapToResponse(examRepository.save(exam));
    }

    // ──────────────────────────────────────────────────────
    // CLOSE — PUBLISHED → CLOSED
    // ──────────────────────────────────────────────────────
    @Transactional
    public ExamResponse closeExam(Long examId, UserPrincipal principal) {
        Exam exam = getOwnedExam(examId, principal.getUserId());

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new RuntimeException(
                    "Only PUBLISHED exams can be closed. Current status: " + exam.getStatus());
        }

        exam.setStatus(ExamStatus.CLOSED);
        return mapToResponse(examRepository.save(exam));
    }

    // ──────────────────────────────────────────────────────
    // GET ALL — role-based filtering
    //   ADMIN    → all exams
    //   FACULTY  → their own exams
    //   STUDENT  → only PUBLISHED exams
    // ──────────────────────────────────────────────────────
    public List<ExamResponse> getExams(UserPrincipal principal) {
        List<Exam> exams;

        if (principal.getUserType() == UserType.ADMIN) {
            exams = examRepository.findAll();

        } else if (principal.getUserType() == UserType.FACULTY) {
            exams = examRepository.findByFaculty_FacultyId(principal.getUserId());

        } else {
            // STUDENT — only published
            exams = examRepository.findByStatus(ExamStatus.PUBLISHED);
        }

        return exams.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────
    // GET BY ID
    // ──────────────────────────────────────────────────────
    public ExamResponse getExamById(Long examId) {
        return mapToResponse(findExamById(examId));
    }

    // ──────────────────────────────────────────────────────
    // Internal helpers — also used by other services
    // ──────────────────────────────────────────────────────
    public Exam findExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exam not found with id: " + examId));
    }

    // Ownership check — throws if exam doesn't belong to faculty
    private Exam getOwnedExam(Long examId, Long facultyId) {
        return examRepository.findByExamIdAndFacultyId(examId, facultyId)
                .orElseThrow(() -> new RuntimeException(
                        "Exam not found or you do not have permission to modify this exam"));
    }

    private void validateExamTimes(ExamRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime()) ||
                request.getEndTime().isEqual(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
    }

    public ExamResponse mapToResponse(Exam exam) {
        return ExamResponse.builder()
                .examId(exam.getExamId())
                .examName(exam.getExamName())
                .subjectId(exam.getSubject().getSubjectId())
                .subjectName(exam.getSubject().getSubjectName())
                .facultyId(exam.getFaculty().getFacultyId())
                .facultyName(exam.getFaculty().getName())
                .department(exam.getSubject().getDepartment())
                .semester(exam.getSubject().getSemester())
                .durationMins(exam.getDurationMins())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .totalMarks(exam.getTotalMarks())
                .status(exam.getStatus())
                .createdAt(exam.getCreatedAt())
                .build();
    }
}
