package com.taskflow.repository;

import com.taskflow.entity.TaskComment;
import com.taskflow.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// F-EXT-01
public interface CommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskOrderByCreatedAtAsc(Task task);
}
