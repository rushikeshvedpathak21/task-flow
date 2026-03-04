import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task, User } from '../../models/models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<!-- Modal header -->
<div class="p-3 text-white rounded-top" style="background:#1E3A5F">
  <div class="d-flex justify-content-between align-items-center">
    <div>
      <div class="fw-bold">{{editMode ? 'Edit Task' : 'Create New Task'}}</div>
      <div *ngIf="editMode && task" class="small" style="color:#93C5FD">Task ID: #{{task.id}}</div>
    </div>
    <button type="button" class="btn-close btn-close-white" (click)="onCancel.emit()"></button>
  </div>
</div>

<div class="p-4">
  <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">

    <!-- Title -->
    <div class="mb-3">
      <label class="form-label fw-semibold small text-uppercase text-muted" style="letter-spacing:.06em">
        Task Title <span class="text-danger">*</span>
      </label>
      <input type="text" class="form-control" formControlName="title" placeholder="e.g. Fix login page bug"
        [class.is-invalid]="submitted && f['title'].errors">
      <div class="invalid-feedback">Task title is required.</div>
    </div>

    <!-- Description -->
    <div class="mb-3">
      <label class="form-label fw-semibold small text-uppercase text-muted" style="letter-spacing:.06em">Description</label>
      <textarea class="form-control" formControlName="description" rows="3"
        placeholder="Add relevant details, context, or acceptance criteria..."></textarea>
    </div>

    <!-- Due Date + Status -->
    <div class="row g-3 mb-3">
      <div class="col-6">
        <label class="form-label fw-semibold small text-uppercase text-muted">Due Date <span class="text-danger">*</span></label>
        <input type="date" class="form-control" formControlName="dueDate"
          [class.is-invalid]="submitted && f['dueDate'].errors">
        <div class="invalid-feedback">Due date is required.</div>
      </div>
      <div class="col-6">
        <label class="form-label fw-semibold small text-uppercase text-muted">Status</label>
        <select class="form-select" formControlName="status">
          <option value="TODO">To-Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>

    <!-- Priority + Assign To (F-EXT-02 + F-EXT-03) — highlighted as new fields -->
    <div class="p-3 rounded mb-3" style="background:#FFFBEB;border:1.5px solid #FCD34D">
      <div class="small fw-bold mb-2" style="color:#D97706;letter-spacing:.07em;text-transform:uppercase">✦ New Fields</div>
      <div class="row g-3">
        <div class="col-6">
          <label class="form-label fw-semibold small text-uppercase text-muted">Priority</label>
          <select class="form-select" formControlName="priority">
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium (default)</option>
            <option value="LOW">Low</option>
          </select>
          <div class="d-flex gap-1 mt-2">
            <span class="badge" style="background:#FEF2F2;color:#DC2626;border:1px solid #FCA5A5">HIGH</span>
            <span class="badge" style="background:#FFFBEB;color:#D97706;border:1px solid #FCD34D">MED</span>
            <span class="badge" style="background:#F0FDF4;color:#16A34A;border:1px solid #86EFAC">LOW</span>
          </div>
        </div>
        <div class="col-6">
          <label class="form-label fw-semibold small text-uppercase text-muted">Assign To</label>
          <select class="form-select" formControlName="assignedTo">
            <option [value]="null">— Unassigned —</option>
            <option *ngFor="let u of users" [value]="u.id">{{u.fullName}}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Edit mode: last modified + danger zone -->
    <ng-container *ngIf="editMode && task">
      <div class="p-2 rounded mb-3 small text-muted" style="background:#F8FAFC;border:1px solid #E2E8F0">
        <strong>Last modified:</strong><br>
        Status: {{task.status}} → {{taskForm.get('status')?.value}}<br>
        Priority: {{task.priority}} → {{taskForm.get('priority')?.value}}
      </div>

      <!-- Danger zone -->
      <div *ngIf="!showDeleteConfirm" class="d-flex align-items-center gap-2 p-2 rounded mb-3"
        style="background:#FFF5F5;border:1px solid #FCA5A5">
        <span class="small fw-bold" style="color:#DC2626">Danger zone:</span>
        <span class="small text-muted flex-fill">This action is permanent and cannot be undone.</span>
        <button type="button" class="btn btn-sm btn-danger" (click)="showDeleteConfirm=true">Delete Task</button>
      </div>
      <div *ngIf="showDeleteConfirm" class="p-2 rounded mb-3" style="background:#FFF5F5;border:1.5px solid #DC2626">
        <p class="small fw-semibold mb-2" style="color:#DC2626">Are you sure you want to delete this task?</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete()">Yes, Delete</button>
          <button type="button" class="btn btn-sm btn-light" (click)="showDeleteConfirm=false">Cancel</button>
        </div>
      </div>
    </ng-container>

    <small class="text-muted">* Required fields</small>

    <div class="d-flex justify-content-end gap-2 mt-3">
      <button type="button" class="btn btn-light" (click)="onCancel.emit()">Cancel</button>
      <button type="submit" class="btn btn-primary fw-bold" style="background:#2563EB;border-color:#2563EB">
        {{editMode ? 'Save Changes' : 'Create Task'}}
      </button>
    </div>
  </form>
</div>
  `
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;
  @Input() editMode = false;
  @Input() users: User[] = [];

  @Output() onSave   = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<number>();

  taskForm!: FormGroup;
  submitted = false;
  showDeleteConfirm = false;

  constructor(private fb: FormBuilder) {}

  get f() { return this.taskForm.controls; }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title:       [this.task?.title || '',       [Validators.required, Validators.maxLength(200)]],
      description: [this.task?.description || ''],
      dueDate:     [this.task?.dueDate || new Date().toISOString().slice(0,10), Validators.required],
      status:      [this.task?.status || 'TODO'],
      priority:    [this.task?.priority || 'MEDIUM'],
      assignedTo:  [this.task?.assignee?.id || null],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.taskForm.invalid) return;
    this.onSave.emit({ ...this.taskForm.value, id: this.task?.id });
  }

  confirmDelete(): void {
    if (this.task) this.onDelete.emit(this.task.id);
  }
}
