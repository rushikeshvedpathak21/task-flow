package com.taskflow.repository;

import com.taskflow.entity.ActivityLog;
import com.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// F-EXT-05
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("""
        SELECT a FROM ActivityLog a
        WHERE a.actor = :user OR a.task.user = :user
        ORDER BY a.createdAt DESC
        LIMIT 20
        """)
    List<ActivityLog> findTop20ForUser(@Param("user") User user);
}
