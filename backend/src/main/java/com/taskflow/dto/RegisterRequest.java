package com.taskflow.dto;

import com.taskflow.entity.Task;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

@Data public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank @Email(message = "Valid email is required")
    private String email;

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}


















