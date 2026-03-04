package com.taskflow.dto;

import java.time.LocalDate;

import com.taskflow.entity.Task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

//─── Task DTOs ────────────────────────────────────────────────────────────────

@Data 
public class TaskRequest {
 @NotBlank(message = "Task title is required")
 @Size(max = 200)
 private String title;

 private String description;

 @NotNull(message = "Due date is required")
 private LocalDate dueDate;

 private Task.TaskStatus status = Task.TaskStatus.TODO;
 private Task.TaskPriority priority = Task.TaskPriority.MEDIUM;

 // F-EXT-02
 private Long assignedTo;
}
