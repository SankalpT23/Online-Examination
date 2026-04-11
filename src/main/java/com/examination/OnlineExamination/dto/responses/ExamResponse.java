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
public class ExamResponse {
    private Long examId;
    private String examName;
    private Long subjectId;
    private String subjectName;
    private Long facultyId;
    private String facultyName;
    private String department;
    private Integer semester;
    private Integer durationMins;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalMarks;
    private ExamStatus status;
    private LocalDateTime createdAt;
}
