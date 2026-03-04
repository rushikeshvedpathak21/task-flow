package com.taskflow.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class CommentResponse {
   private Long id;
   private Long taskId;
   private UserDTO author;
   private String body;
   private LocalDateTime createdAt;
}
