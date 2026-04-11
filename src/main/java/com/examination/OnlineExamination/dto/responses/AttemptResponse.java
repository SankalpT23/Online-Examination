package com.examination.OnlineExamination.dto.responses;

import com.examination.OnlineExamination.enums.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttemptResponse {
    private Long attemptId;
    private Long studentId;
    private String studentName;
    private Long examId;
    private String examName;
    private Integer durationMins;
    private LocalDateTime startTime;
    private LocalDateTime submitTime;
    private LocalDateTime examEndTime;
    private Integer score;
    private Integer totalMarks;
    private AttemptStatus status;
    private String message;
}
