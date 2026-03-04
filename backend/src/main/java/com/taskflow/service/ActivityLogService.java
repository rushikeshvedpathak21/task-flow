package com.taskflow.service;

import com.taskflow.dto.ActivityResponse;
import com.taskflow.entity.ActivityLog;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.repository.ActivityLogRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// F-EXT-05: Activity Feed
@Service
@RequiredArgsConstructor
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    /** Called by TaskService and CommentService — never directly from controllers */
    public void log(Task task, User actor, String actionCode, String message) {
        ActivityLog entry = ActivityLog.builder()
            .task(task)
            .actor(actor)
            .actionCode(actionCode)
            .message(message)
            .build();
        activityLogRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivityFeed(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return activityLogRepository.findTop20ForUser(user)
            .stream()
            .map(a -> ActivityResponse.builder()
                .id(a.getId())
                .taskId(a.getTask() != null ? a.getTask().getId() : null)
                .actor(AuthService.toDTO(a.getActor()))
                .actionCode(a.getActionCode())
                .message(a.getMessage())
                .createdAt(a.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }
}
