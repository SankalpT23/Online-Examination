package com.examination.OnlineExamination.dto.responses;

import com.examination.OnlineExamination.enums.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private Long examId;
    private String examName;
    private String subjectName;
    private String facultyName;
    private Integer durationMins;
    private LocalDateTime examStartTime;
    private LocalDateTime examEndTime;
    private Integer totalMarks;
    private ExamStatus examStatus;
    private LocalDateTime enrolledDate;
    private String studentEmail;
}
