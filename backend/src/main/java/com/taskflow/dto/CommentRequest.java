package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

//─── Comment DTOs ─────────────────────────────────────────────────────────────

@Data  
public class CommentRequest {
 @NotBlank(message = "Comment body is required")
 private String body;
}