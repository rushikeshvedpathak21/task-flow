-- ============================================================
-- TaskFlow — Complete Database Schema
-- Run this against your MySQL 8.x / PostgreSQL 15.x database
-- ============================================================

CREATE DATABASE IF NOT EXISTS taskflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── tasks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)  NOT NULL,
  description TEXT,
  due_date    DATE          NOT NULL,
  status      ENUM('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
  user_id     BIGINT        NOT NULL,
  -- F-EXT-02: Task Assignment
  assigned_to BIGINT        NULL,
  -- F-EXT-03: Priority Levels
  priority    ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_task_owner    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ── task_comments (F-EXT-01) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS task_comments (
  id         BIGINT    NOT NULL AUTO_INCREMENT,
  task_id    BIGINT    NOT NULL,
  author_id  BIGINT    NOT NULL,
  body       TEXT      NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comment_task   FOREIGN KEY (task_id)   REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── activity_log (F-EXT-05) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  task_id     BIGINT       NULL,
  actor_id    BIGINT       NOT NULL,
  action_code VARCHAR(50)  NOT NULL,
  message     VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_activity_task  FOREIGN KEY (task_id)  REFERENCES tasks(id) ON DELETE SET NULL,
  CONSTRAINT fk_activity_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Indexes for common queries ───────────────────────────────
CREATE INDEX idx_tasks_user_id     ON tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_priority    ON tasks(priority);
CREATE INDEX idx_tasks_due_date    ON tasks(due_date);
CREATE INDEX idx_comments_task_id  ON task_comments(task_id);
CREATE INDEX idx_activity_actor    ON activity_log(actor_id);
CREATE INDEX idx_activity_task     ON activity_log(task_id);
