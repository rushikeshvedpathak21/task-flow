package com.taskflow.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//─── Activity DTO ─────────────────────────────────────────────────────────────

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class ActivityResponse {
 private Long id;
 private Long taskId;
 private UserDTO actor;
 private String actionCode;
 private String message;
 private LocalDateTime createdAt;
}
