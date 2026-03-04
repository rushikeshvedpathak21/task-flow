package com.taskflow.dto;
//─── Analytics DTO ────────────────────────────────────────────────────────────

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class TaskSummaryDTO {
 private int totalTasks;
 private int todo;
 private int inProgress;
 private int done;
 private int high;
 private int medium;
 private int low;
 private double completionRate;
 private int overdueCount;
 private int tasksThisWeek;
}
