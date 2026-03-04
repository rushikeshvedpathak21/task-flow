package com.taskflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// F-EXT-05: Activity Feed
@Entity
@Table(name = "activity_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable — set to NULL when task is deleted (ON DELETE SET NULL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = true,
            foreignKey = @ForeignKey(name = "fk_activity_task"))
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Column(name = "action_code", nullable = false, length = 50)
    private String actionCode;

    @Column(nullable = false, length = 500)
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Action code constants
    public static final String TASK_CREATED          = "TASK_CREATED";
    public static final String TASK_STATUS_CHANGED   = "TASK_STATUS_CHANGED";
    public static final String TASK_ASSIGNED         = "TASK_ASSIGNED";
    public static final String TASK_PRIORITY_CHANGED = "TASK_PRIORITY_CHANGED";
    public static final String COMMENT_ADDED         = "COMMENT_ADDED";
    public static final String TASK_DELETED          = "TASK_DELETED";
}
