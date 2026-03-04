// src/app/models/models.ts

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  owner: User;
  assignee?: User | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  status?: string;
  priority?: string;
  assignedTo?: number | null;
}

export interface Comment {
  id: number;
  taskId: number;
  author: User;
  body: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: number;
  taskId: number | null;
  actor: User;
  actionCode: string;
  message: string;
  createdAt: string;
}

export interface TaskSummary {
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
  high: number;
  medium: number;
  low: number;
  completionRate: number;
  overdueCount: number;
  tasksThisWeek: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
