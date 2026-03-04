package com.taskflow.service;

import com.taskflow.dto.TaskRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.repository.ActivityLogRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private UserRepository userRepository;
    @Mock private ActivityLogRepository activityLogRepository;

    @InjectMocks private ActivityLogService activityLogService;
    private TaskService taskService;

    private User testUser;

    @BeforeEach
    void setUp() {
        activityLogService = new ActivityLogService(activityLogRepository, userRepository);
        taskService = new TaskService(taskRepository, userRepository, activityLogService);

        testUser = User.builder()
            .id(1L).fullName("Alex Johnson").email("alex@example.com")
            .passwordHash("$2a$10$hashed").build();
    }

    @Test
    @DisplayName("createTask — saves task and returns response")
    void createTask_savesAndReturns() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Fix Login Bug");
        request.setDueDate(LocalDate.now().plusDays(3));
        request.setStatus(Task.TaskStatus.TODO);
        request.setPriority(Task.TaskPriority.HIGH);

        Task saved = Task.builder()
            .id(1L).title("Fix Login Bug").dueDate(request.getDueDate())
            .status(Task.TaskStatus.TODO).priority(Task.TaskPriority.HIGH)
            .user(testUser).build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(testUser));
        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        TaskResponse response = taskService.createTask(request, "alex@example.com");

        assertThat(response.getTitle()).isEqualTo("Fix Login Bug");
        assertThat(response.getStatus()).isEqualTo("TODO");
        assertThat(response.getPriority()).isEqualTo("HIGH");
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("createTask — throws when user not found")
    void createTask_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());
        TaskRequest request = new TaskRequest();
        request.setTitle("Test");
        request.setDueDate(LocalDate.now());

        assertThatThrownBy(() -> taskService.createTask(request, "unknown@example.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("deleteTask — throws 403 when user does not own task")
    void deleteTask_throwsWhenNotOwner() {
        User otherUser = User.builder().id(2L).email("other@example.com").fullName("Other User").build();
        Task task = Task.builder().id(1L).title("Test").user(otherUser).build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(testUser));
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.deleteTask(1L, "alex@example.com"))
            .isInstanceOf(SecurityException.class)
            .hasMessageContaining("Access denied");
    }
}
