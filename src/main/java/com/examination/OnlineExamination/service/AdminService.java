package com.examination.OnlineExamination.service;


import com.examination.OnlineExamination.dto.responses.*;
import com.examination.OnlineExamination.enums.ExamStatus;
import com.examination.OnlineExamination.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository attemptRepository;
    private final ResultRepository resultRepository;
    private final StudentAnswerRepository answerRepository;

    // ──────────────────────────────────────────────────────
    // DASHBOARD STATS
    // ──────────────────────────────────────────────────────
    public AdminDashboardResponse getDashboardStats() {
        return AdminDashboardResponse.builder()
                .totalStudents(studentRepository.count())
                .totalFaculty(facultyRepository.count())
                .totalExams(examRepository.count())
                .publishedExams(examRepository.countByStatus(ExamStatus.PUBLISHED))
                .totalAttempts(attemptRepository.countAllSubmitted())
                .totalResults(resultRepository.count())
                .build();
    }

    // ──────────────────────────────────────────────────────
    // ALL STUDENTS LIST
    // ──────────────────────────────────────────────────────
    public List<StudentSummaryResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(s -> StudentSummaryResponse.builder()
                        .studentId(s.getStudentId())
                        .name(s.getName())
                        .email(s.getEmail())
                        .department(s.getDepartment())
                        .semester(s.getSemester())
                        .totalAttempts(attemptRepository.countByStudent_StudentId(s.getStudentId()))
                        .build())
                .toList();
    }

    // ──────────────────────────────────────────────────────
    // ALL FACULTY LIST
    // ──────────────────────────────────────────────────────
    public List<FacultySummaryResponse> getAllFaculty() {
        return facultyRepository.findAll().stream()
                .map(f -> FacultySummaryResponse.builder()
                        .facultyId(f.getFacultyId())
                        .name(f.getName())
                        .email(f.getEmail())
                        .department(f.getDepartment())
                        .totalExams(examRepository.countByFaculty_FacultyId(f.getFacultyId()))
                        .build())
                .toList();
    }

    // ──────────────────────────────────────────────────────
    // WEAK QUESTIONS ANALYSIS FOR AN EXAM
    // ──────────────────────────────────────────────────────
    public List<WeakQuestionResponse> getWeakQuestions(Long examId) {
        List<Object[]> rawData = answerRepository.findWeakQuestionsByExam(examId);
        List<WeakQuestionResponse> result = new ArrayList<>();

        for (Object[] row : rawData) {
            Long qId           = ((Number) row[0]).longValue();
            String qText       = (String) row[1];
            String correct     = row[2] != null ? row[2].toString() : "N/A";
            Long total         = ((Number) row[3]).longValue();
            Long correctCount  = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            Long wrongCount    = total - correctCount;
            double accuracy    = total > 0
                    ? Math.round((correctCount * 100.0 / total) * 100.0) / 100.0
                    : 0.0;

            result.add(WeakQuestionResponse.builder()
                    .questionId(qId)
                    .questionText(qText)
                    .correctOption(correct)
                    .totalAttempts(total)
                    .correctAnswers(correctCount)
                    .wrongAnswers(wrongCount)
                    .accuracyPercentage(accuracy)
                    .build());
        }
        return result;
    }
}
