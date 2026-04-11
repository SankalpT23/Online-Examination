package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaderBoardResponse {
    private Integer rank;
    private Long studentId;
    private String studentName;
    private String department;
    private Integer semester;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
}
