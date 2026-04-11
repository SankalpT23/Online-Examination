package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResultResponse {
    private Long resultId;
    private Long attemptId;
    private Long studentId;
    private String studentName;
    private Long examId;
    private String examName;
    private String subjectName;
    private Integer totalScore;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
    private String result;          // PASS / FAIL
    private LocalDateTime resultDate;
}
