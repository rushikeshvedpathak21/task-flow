package com.taskflow.repository;

import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    List<Task> findByUserAndStatusOrderByCreatedAtDesc(User user, Task.TaskStatus status);

    List<Task> findByUserAndPriorityOrderByCreatedAtDesc(User user, Task.TaskPriority priority);

    // ── Analytics queries (JPQL — computed in DB, not in Java) ───────────────

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.status = :status")
    int countByUserAndStatus(@Param("user") User user, @Param("status") Task.TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.priority = :priority")
    int countByUserAndPriority(@Param("user") User user, @Param("priority") Task.TaskPriority priority);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.dueDate < :today AND t.status != 'DONE'")
    int countOverdue(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.createdAt >= :since")
    int countTasksSince(@Param("user") User user, @Param("since") java.time.LocalDateTime since);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user")
    int countByUser(@Param("user") User user);
}
