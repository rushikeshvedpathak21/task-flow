import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskRequest, TaskSummary } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private base = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.base);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  createTask(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.base, request);
  }

  updateTask(id: number, request: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.base}/${id}`, request);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getSummary(): Observable<TaskSummary> {
    return this.http.get<TaskSummary>(`${this.base}/summary`);
  }
}
