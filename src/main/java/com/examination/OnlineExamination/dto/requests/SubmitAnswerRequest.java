package com.examination.OnlineExamination.dto.requests;

import com.examination.OnlineExamination.enums.CorrectOption;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SubmitAnswerRequest {

    @NotEmpty(message = "Answers list cannot be empty")
    @Valid
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {

        @NotNull(message = "Question ID is required in each answer")
        private Long questionId;

        // Nullable — student allowed to skip
        private CorrectOption selectedOption;
    }
}
