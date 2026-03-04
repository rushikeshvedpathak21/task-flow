package com.taskflow.controller;

import com.taskflow.dto.*;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** GET /api/tasks — all tasks for current user */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.getTasksForUser(user.getUsername()));
    }

    /** GET /api/tasks/summary — analytics (F-EXT-04) */
    @GetMapping("/summary")
    public ResponseEntity<TaskSummaryDTO> getSummary(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.getSummary(user.getUsername()));
    }

    /** GET /api/tasks/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id,
                                                 @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.getTask(id, user.getUsername()));
    }

    /** POST /api/tasks — 201 Created */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
                                                    @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.createTask(request, user.getUsername()));
    }

    /** PUT /api/tasks/{id} — 200 OK */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id,
                                                    @Valid @RequestBody TaskRequest request,
                                                    @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(taskService.updateTask(id, request, user.getUsername()));
    }

    /** DELETE /api/tasks/{id} — 204 No Content */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails user) {
        taskService.deleteTask(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
