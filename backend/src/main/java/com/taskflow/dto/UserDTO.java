package com.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//─── User DTO ─────────────────────────────────────────────────────────────────

@Data @AllArgsConstructor @NoArgsConstructor
public class UserDTO {
 private Long id;
 private String fullName;
 private String email;
}
