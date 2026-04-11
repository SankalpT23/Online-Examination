package com.examination.OnlineExamination.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeakQuestionResponse {
    private Long questionId;
    private String questionText;
    private String correctOption;
    private Long totalAttempts;
    private Long correctAnswers;
    private Long wrongAnswers;
    private Double accuracyPercentage;
}
