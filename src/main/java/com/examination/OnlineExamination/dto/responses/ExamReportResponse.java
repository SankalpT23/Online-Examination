package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExamReportResponse {
    private Long examId;
    private String examName;
    private Long totalAttempts;
    private Double averageScore;
    private Integer highestScore;
    private Integer lowestScore;
    private Long passedCount;
    private Long failedCount;
    private Double passPercentage;
}
