package com.examination.OnlineExamination.dto.requests;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;
}
