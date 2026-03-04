package com.taskflow.controller;

import com.taskflow.dto.*;
import com.taskflow.entity.User;
import com.taskflow.repository.UserRepository;
import com.taskflow.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

// ─── F-EXT-01: Comment Controller ───────────────────────────────────────────
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class CommentController {

    private final CommentService commentService;

    /** GET /api/tasks/{taskId}/comments */
    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getComments(taskId));
    }

    /** POST /api/tasks/{taskId}/comments — 201 Created */
    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long taskId,
                                                       @Valid @RequestBody CommentRequest request,
                                                       @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(commentService.addComment(taskId, request.getBody(), user.getUsername()));
    }

    /** DELETE /api/comments/{commentId} — 204 No Content */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
                                               @AuthenticationPrincipal UserDetails user) {
        commentService.deleteComment(commentId, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}

// ─── F-EXT-02: User Controller ───────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final UserRepository userRepository;

    /** GET /api/users — id + fullName + email only, NO passwords */
    @GetMapping
    public ResponseEntity<List<UserDTO>> listUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
            .map(AuthService::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}

// ─── F-EXT-05: Activity Controller ──────────────────────────────────────────
@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
class ActivityController {

    private final ActivityLogService activityLogService;

    /** GET /api/activity — 20 most recent entries */
    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getActivity(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(activityLogService.getActivityFeed(user.getUsername()));
    }
}
