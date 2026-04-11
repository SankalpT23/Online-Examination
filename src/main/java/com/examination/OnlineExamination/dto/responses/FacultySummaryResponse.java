package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultySummaryResponse {
    private Long facultyId;
    private String name;
    private String email;
    private String department;
    private Long totalExams;
}
