<<<<<<< HEAD
# TaskFlow — Full-Stack Task Management Application

> Angular 17 · Spring Boot 3 · Bootstrap 5 · Tailwind CSS 3 · MySQL/PostgreSQL

---

## Project Structure

```
taskflow-project/
├── frontend/          # Angular 17 SPA
├── backend/           # Spring Boot 3 REST API
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Java (JDK) | 17+ |
| Maven | 3.8+ |
| MySQL | 8.x or PostgreSQL 15.x |

---

## Quick Start

### 1. Database Setup (MySQL)

```sql
CREATE DATABASE taskflow;
CREATE USER 'taskflow_user'@'localhost' IDENTIFIED BY 'taskflow_pass';
GRANT ALL PRIVILEGES ON taskflow.* TO 'taskflow_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```bash
cd backend
# Update src/main/resources/application.properties with your DB credentials
mvn clean install
mvn spring-boot:run
# API runs on http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
ng serve
# App runs on http://localhost:4200
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, receive JWT |
| GET | /api/tasks | Yes | Get all tasks |
| POST | /api/tasks | Yes | Create task |
| GET | /api/tasks/{id} | Yes | Get task by ID |
| PUT | /api/tasks/{id} | Yes | Update task |
| DELETE | /api/tasks/{id} | Yes | Delete task |
| GET | /api/tasks/summary | Yes | Analytics summary |
| GET | /api/tasks/{id}/comments | Yes | Get comments |
| POST | /api/tasks/{id}/comments | Yes | Post comment |
| DELETE | /api/comments/{id} | Yes | Delete comment |
| GET | /api/users | Yes | List all users |
| GET | /api/activity | Yes | Activity feed |

---

## Features

### Phase 1 (Core)
- ✅ User Registration & Login with JWT
- ✅ Task CRUD (Create, Read, Update, Delete)
- ✅ Task status: To-Do, In Progress, Done
- ✅ Responsive UI (Bootstrap + Tailwind)
- ✅ Route Guards (AuthGuard, GuestGuard)
- ✅ Form Validation

### Phase 1 Expansion
- ✅ F-EXT-01: Task Comments
- ✅ F-EXT-02: Task Assignment
- ✅ F-EXT-03: Priority Levels (High / Medium / Low)
- ✅ F-EXT-04: Dashboard Analytics (Chart.js)
- ✅ F-EXT-05: Activity Feed
- ✅ F-EXT-06: Due Date Alerts

---

## Default Credentials (Dev Seed)

```
Email:    alex@example.com
Password: password123
```
=======
# task-flow
>>>>>>> 60088589ebcb160079c60a7aa61666f776b578ad
