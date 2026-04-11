package com.examination.OnlineExamination.dto.requests;

import com.examination.OnlineExamination.enums.CorrectOption;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    @Size(min = 5, max = 1000, message = "Question text must be between 5 and 1000 characters")
    private String questionText;

    @NotBlank(message = "Option A is required")
    @Size(max = 255, message = "Option A cannot exceed 255 characters")
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Size(max = 255, message = "Option B cannot exceed 255 characters")
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Size(max = 255, message = "Option C cannot exceed 255 characters")
    private String optionC;

    @NotBlank(message = "Option D is required")
    @Size(max = 255, message = "Option D cannot exceed 255 characters")
    private String optionD;

    @NotNull(message = "Correct option is required — A, B, C or D")
    private CorrectOption correctOption;

    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks = 1;
}
