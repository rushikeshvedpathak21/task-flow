package com.taskflow.service;

import com.taskflow.dto.*;
import com.taskflow.entity.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// ─── F-EXT-01: Comment Service ───────────────────────────────────────────────

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    private CommentResponse toResponse(TaskComment c) {
        return CommentResponse.builder()
            .id(c.getId())
            .taskId(c.getTask().getId())
            .author(AuthService.toDTO(c.getAuthor()))
            .body(c.getBody())
            .createdAt(c.getCreatedAt())
            .build();
    }

    public List<CommentResponse> getComments(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        return commentRepository.findByTaskOrderByCreatedAtAsc(task)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CommentResponse addComment(Long taskId, String body, String authorEmail) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        User author = userRepository.findByEmail(authorEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TaskComment comment = TaskComment.builder()
            .task(task).author(author).body(body).build();
        commentRepository.save(comment);

        // Log — F-EXT-05
        activityLogService.log(task, author, ActivityLog.COMMENT_ADDED,
            author.getFullName().split(" ")[0] + " commented on \"" + task.getTitle() + "\"");

        return toResponse(comment);
    }

    public void deleteComment(Long commentId, String requesterEmail) {
        TaskComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!comment.getAuthor().getEmail().equals(requesterEmail)) {
            throw new SecurityException("Forbidden — you can only delete your own comments");
        }
        commentRepository.delete(comment);
    }
}
