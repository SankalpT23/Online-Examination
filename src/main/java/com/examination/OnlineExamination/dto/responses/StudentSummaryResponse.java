package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryResponse {
    private Long studentId;
    private String name;
    private String email;
    private String department;
    private Integer semester;
    private Long totalAttempts;
}
