package com.taskflow.service;

import com.taskflow.dto.*;
import com.taskflow.entity.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder()
            .id(t.getId())
            .title(t.getTitle())
            .description(t.getDescription())
            .dueDate(t.getDueDate())
            .status(t.getStatus().name())
            .priority(t.getPriority().name())
            .owner(AuthService.toDTO(t.getUser()))
            .assignee(AuthService.toDTO(t.getAssignedTo()))
            .createdAt(t.getCreatedAt())
            .updatedAt(t.getUpdatedAt())
            .build();
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<TaskResponse> getTasksForUser(String email) {
        User user = resolveCurrentUser(email);
        return taskRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskResponse getTask(Long id, String email) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        User user = resolveCurrentUser(email);
        if (!task.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        return toResponse(task);
    }

    public TaskResponse createTask(TaskRequest request, String email) {
        User owner = resolveCurrentUser(email);
        User assignee = request.getAssignedTo() != null
            ? userRepository.findById(request.getAssignedTo()).orElse(null) : null;

        Task task = Task.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .dueDate(request.getDueDate())
            .status(request.getStatus() != null ? request.getStatus() : Task.TaskStatus.TODO)
            .priority(request.getPriority() != null ? request.getPriority() : Task.TaskPriority.MEDIUM)
            .user(owner)
            .assignedTo(assignee)
            .build();
        taskRepository.save(task);

        // Log — F-EXT-05
        activityLogService.log(task, owner, ActivityLog.TASK_CREATED,
            owner.getFullName().split(" ")[0] + " created task \"" + task.getTitle() + "\"");

        return toResponse(task);
    }

    public TaskResponse updateTask(Long id, TaskRequest request, String email) {
        User user = resolveCurrentUser(email);
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied — you do not own this task");
        }

        Task.TaskStatus oldStatus = task.getStatus();
        Task.TaskPriority oldPriority = task.getPriority();
        User oldAssignee = task.getAssignedTo();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());

        User newAssignee = request.getAssignedTo() != null
            ? userRepository.findById(request.getAssignedTo()).orElse(null) : null;
        task.setAssignedTo(newAssignee);
        taskRepository.save(task);

        // Activity logs — F-EXT-05
        if (oldStatus != task.getStatus()) {
            activityLogService.log(task, user, ActivityLog.TASK_STATUS_CHANGED,
                user.getFullName().split(" ")[0] + " changed status of \"" + task.getTitle()
                    + "\" to " + task.getStatus().name());
        }
        if (oldPriority != task.getPriority()) {
            activityLogService.log(task, user, ActivityLog.TASK_PRIORITY_CHANGED,
                user.getFullName().split(" ")[0] + " changed priority of \"" + task.getTitle()
                    + "\" to " + task.getPriority().name());
        }
        boolean assigneeChanged = (oldAssignee == null && newAssignee != null)
            || (oldAssignee != null && !oldAssignee.getId().equals(newAssignee != null ? newAssignee.getId() : null));
        if (assigneeChanged && newAssignee != null) {
            activityLogService.log(task, user, ActivityLog.TASK_ASSIGNED,
                user.getFullName().split(" ")[0] + " assigned \"" + task.getTitle()
                    + "\" to " + newAssignee.getFullName());
        }

        return toResponse(task);
    }

    public void deleteTask(Long id, String email) {
        User user = resolveCurrentUser(email);
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        // Log before delete so we still have title — task_id will be set to null via FK
        activityLogService.log(null, user, ActivityLog.TASK_DELETED,
            user.getFullName().split(" ")[0] + " deleted task \"" + task.getTitle() + "\"");
        taskRepository.delete(task);
    }

    // ── Analytics — F-EXT-04 ─────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public TaskSummaryDTO getSummary(String email) {
        User user = resolveCurrentUser(email);
        int total = taskRepository.countByUser(user);
        int todo = taskRepository.countByUserAndStatus(user, Task.TaskStatus.TODO);
        int inProgress = taskRepository.countByUserAndStatus(user, Task.TaskStatus.IN_PROGRESS);
        int done = taskRepository.countByUserAndStatus(user, Task.TaskStatus.DONE);
        int high = taskRepository.countByUserAndPriority(user, Task.TaskPriority.HIGH);
        int medium = taskRepository.countByUserAndPriority(user, Task.TaskPriority.MEDIUM);
        int low = taskRepository.countByUserAndPriority(user, Task.TaskPriority.LOW);
        int overdue = taskRepository.countOverdue(user, LocalDate.now());
        int thisWeek = taskRepository.countTasksSince(user, LocalDateTime.now().minusDays(7));
        double completionRate = total > 0 ? Math.round((done * 1000.0 / total)) / 10.0 : 0.0;

        return TaskSummaryDTO.builder()
            .totalTasks(total).todo(todo).inProgress(inProgress).done(done)
            .high(high).medium(medium).low(low)
            .completionRate(completionRate).overdueCount(overdue).tasksThisWeek(thisWeek)
            .build();
    }
}
