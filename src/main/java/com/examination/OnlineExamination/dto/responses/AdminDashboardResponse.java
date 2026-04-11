package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardResponse {
    private Long totalStudents;
    private Long totalFaculty;
    private Long totalExams;
    private Long publishedExams;
    private Long totalAttempts;
    private Long totalResults;
}
