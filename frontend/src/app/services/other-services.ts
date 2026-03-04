import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comment, ActivityEntry, User } from '../models/models';

// F-EXT-01
@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  getComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/tasks/${taskId}/comments`);
  }

  addComment(taskId: number, body: string): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/tasks/${taskId}/comments`, { body });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${commentId}`);
  }
}

// F-EXT-05
@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private http: HttpClient) {}

  getActivityFeed(): Observable<ActivityEntry[]> {
    return this.http.get<ActivityEntry[]>(`${environment.apiUrl}/activity`);
  }
}

// F-EXT-02
@Injectable({ providedIn: 'root' })
export class UserListService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }
}
