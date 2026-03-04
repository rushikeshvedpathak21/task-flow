package com.taskflow.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class TaskResponse {
   private Long id;
   private String title;
   private String description;
   private LocalDate dueDate;
   private String status;
   private String priority;
   private UserDTO owner;
   private UserDTO assignee;
   private LocalDateTime createdAt;
   private LocalDateTime updatedAt;
}
