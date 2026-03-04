import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Task, User, Comment, ActivityEntry, TaskSummary } from '../../models/models';
import { TaskService } from '../../services/task.service';
import { CommentService, ActivityService, UserListService } from '../../services/other-services';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDueDatePipe, RelativeTimePipe } from '../../pipes/pipes';

type FilterTab = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ASSIGNED_TO_ME';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, TaskFormComponent, TaskDueDatePipe, RelativeTimePipe],
  template: `
<div class="min-vh-100" style="background:#F4F6FA">
  <app-navbar></app-navbar>

  <div class="container-fluid px-4 py-3" style="max-width:1400px;margin:0 auto">

    <!-- F-EXT-06: Alert Banner -->
    <div *ngIf="!alertDismissed && (overdueCount > 0 || dueTodayCount > 0)"
      class="alert d-flex align-items-center gap-2 mb-3 py-2"
      style="background:#FEF2F2;border:1.5px solid #FCA5A5;border-radius:10px">
      <div style="width:8px;height:8px;border-radius:50%;background:#EF4444;flex-shrink:0"></div>
      <span class="small fw-semibold flex-fill" style="color:#DC2626">
        You have
        <span *ngIf="overdueCount>0">{{overdueCount}} overdue task{{overdueCount>1?'s':''}}</span>
        <span *ngIf="overdueCount>0 && dueTodayCount>0"> and </span>
        <span *ngIf="dueTodayCount>0">{{dueTodayCount}} task{{dueTodayCount>1?'s':''}} due today</span>.
      </span>
      <button class="btn-close btn-sm" (click)="alertDismissed=true"></button>
    </div>

    <!-- Stats row -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-md-3" *ngFor="let s of stats">
        <div class="bg-white rounded-3 p-3 shadow-sm" [style.border-left]="'4px solid ' + s.color">
          <div class="small fw-semibold text-uppercase text-muted mb-1" style="letter-spacing:.05em;font-size:.7rem">{{s.label}}</div>
          <div class="fw-black" style="font-size:1.8rem;color:#1E293B">{{s.value}}</div>
        </div>
      </div>
    </div>

    <!-- F-EXT-04: Analytics Panel -->
    <div *ngIf="showAnalytics && summary" class="bg-white rounded-3 shadow-sm p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="fw-bold" style="color:#1E293B">Analytics Overview</span>
        <button class="btn btn-sm btn-light" (click)="showAnalytics=false">Hide Analytics</button>
      </div>
      <!-- KPI cards -->
      <div class="row g-2 mb-3">
        <div class="col" *ngFor="let k of kpis">
          <div class="rounded p-2 text-center" [style.border-top]="'3px solid ' + k.color" style="background:#F8FAFC">
            <div class="fw-black" style="font-size:1.4rem;color:#1E293B">{{k.value}}</div>
            <div class="text-muted" style="font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em">{{k.label}}</div>
          </div>
        </div>
      </div>
      <!-- Simple text charts since Chart.js canvas needs AfterViewInit -->
      <div class="row g-3">
        <div class="col-md-6">
          <div class="small fw-bold mb-2">Task Status Breakdown</div>
          <div *ngFor="let item of statusBreakdown" class="d-flex align-items-center gap-2 mb-2">
            <div style="width:12px;height:12px;border-radius:2px;flex-shrink:0" [style.background]="item.color"></div>
            <div class="flex-fill small">{{item.label}}</div>
            <div class="small text-muted">{{item.count}}</div>
            <div class="rounded" style="height:8px;min-width:4px" [style.width]="(item.count / (summary!.totalTasks || 1) * 120) + 'px'" [style.background]="item.color"></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="small fw-bold mb-2">Tasks by Priority</div>
          <div *ngFor="let item of priorityBreakdown" class="d-flex align-items-center gap-2 mb-2">
            <div style="width:12px;height:12px;border-radius:2px;flex-shrink:0" [style.background]="item.color"></div>
            <div class="flex-fill small">{{item.label}}</div>
            <div class="small text-muted">{{item.count}}</div>
            <div class="rounded" style="height:8px;min-width:4px" [style.width]="(item.count / (summary!.totalTasks || 1) * 120) + 'px'" [style.background]="item.color"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
      <!-- Filter tabs -->
      <div class="d-flex rounded overflow-hidden border bg-white" style="border-color:#E2E8F0!important">
        <button *ngFor="let tab of filterTabs" (click)="activeFilter=tab.key; applyFilter()"
          class="btn btn-sm border-0 fw-semibold"
          [style.background]="activeFilter===tab.key ? '#2563EB' : 'transparent'"
          [style.color]="activeFilter===tab.key ? '#fff' : '#64748B'">
          {{tab.label}}
        </button>
      </div>

      <input type="text" class="form-control form-control-sm flex-fill" [(ngModel)]="searchTerm"
        (ngModelChange)="applyFilter()" placeholder="Search tasks..." style="min-width:140px;max-width:220px">

      <button class="btn btn-sm fw-semibold"
        [style.background]="sortByPriority ? '#7C3AED' : '#fff'"
        [style.color]="sortByPriority ? '#fff' : '#1E293B'"
        [style.border]="sortByPriority ? '1px solid #7C3AED' : '1px solid #E2E8F0'"
        (click)="toggleSort()">
        <i class="bi bi-sort-down me-1"></i>Sort: Priority
      </button>

      <button *ngIf="!showAnalytics" class="btn btn-sm fw-semibold" (click)="loadAnalytics()"
        style="background:#2563EB;color:#fff;border:none">
        <i class="bi bi-bar-chart me-1"></i>Show Analytics
      </button>

      <button class="btn btn-sm fw-bold ms-auto"
        style="background:#16A34A;color:#fff;border:none" (click)="openCreate()">
        <i class="bi bi-plus-lg me-1"></i>New Task
      </button>
    </div>

    <!-- Main grid + Activity feed -->
    <div class="d-flex gap-3 align-items-start">

      <!-- Task grid -->
      <div class="flex-fill">
        <div *ngIf="filteredTasks.length === 0" class="bg-white rounded-3 p-5 text-center text-muted shadow-sm">
          {{tasks.length === 0 ? 'You have no tasks yet. Create one to get started!' : 'No tasks match the current filter.'}}
        </div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-4" *ngFor="let task of filteredTasks">
            <div class="bg-white rounded-3 shadow-sm task-card h-100"
              [style.border-left]="'4px solid ' + getDueBorderColor(task)"
              (click)="openDetail(task)">
              <div class="p-3">
                <div class="fw-bold mb-1" style="font-size:.85rem;line-height:1.3"
                  [style.color]="getDueState(task)==='overdue' ? '#DC2626' : '#1E293B'">
                  {{task.title}}
                </div>
                <div class="text-muted mb-2" style="font-size:.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                  {{task.description}}
                </div>
                <!-- Status + Priority badges -->
                <div class="d-flex flex-wrap gap-1 mb-2">
                  <span class="badge rounded-pill" [ngClass]="getStatusBadgeClass(task.status)">
                    {{getStatusLabel(task.status)}}
                  </span>
                  <span class="badge rounded-pill" [ngClass]="getPriorityBadgeClass(task.priority)">
                    {{task.priority}}
                  </span>
                </div>
                <!-- Assignee -->
                <div *ngIf="task.assignee" class="d-flex align-items-center gap-2 mb-2">
                  <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                    style="width:22px;height:22px;font-size:.6rem;background:#2563EB;flex-shrink:0">
                    {{getInitials(task.assignee.fullName)}}
                  </div>
                  <span style="font-size:.72rem;color:#64748B">{{task.assignee.fullName}}</span>
                </div>
                <!-- Due date -->
                <div style="font-size:.72rem" [class]="getDueLabelClass(task)">
                  <span *ngIf="getDueState(task)==='overdue'">Overdue — </span>
                  <span *ngIf="getDueState(task)==='today'">Due Today — </span>
                  {{task.dueDate}}
                </div>
              </div>
              <div class="border-top d-flex justify-content-end gap-2 p-2" (click)="$event.stopPropagation()">
                <button class="btn btn-sm btn-primary fw-bold" style="font-size:.7rem;background:#2563EB;border-color:#2563EB"
                  (click)="openEdit(task)">Edit</button>
                <button class="btn btn-sm btn-danger fw-bold" style="font-size:.7rem"
                  (click)="confirmDelete(task)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- F-EXT-05: Activity Feed -->
      <div class="bg-white rounded-3 shadow-sm flex-shrink-0" style="width:280px">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <span class="fw-bold small" style="color:#1E293B">Activity Feed</span>
          <button class="btn btn-sm" (click)="loadActivity()"
            style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;font-size:.7rem;font-weight:700">
            Refresh
          </button>
        </div>
        <div style="max-height:480px;overflow-y:auto">
          <div *ngFor="let entry of activityFeed; let last=last"
            class="d-flex gap-2 align-items-start p-3"
            [style.border-bottom]="!last ? '1px solid #F8FAFC' : 'none'">
            <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style="width:32px;height:32px;font-size:.85rem"
              [style.background]="getActivityBgColor(entry.actionCode)">
              {{getActivityIcon(entry.actionCode)}}
            </div>
            <div>
              <div style="font-size:.72rem;color:#1E293B;line-height:1.4">{{entry.message}}</div>
              <div style="font-size:.65rem;color:#64748B;margin-top:2px">{{entry.createdAt | relativeTime}}</div>
            </div>
          </div>
          <div *ngIf="activityFeed.length===0" class="p-3 text-center text-muted small">No activity yet.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Task Modal -->
  <div *ngIf="showCreateModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.55)">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 rounded-3 shadow">
        <app-task-form [users]="allUsers" (onSave)="createTask($event)" (onCancel)="showCreateModal=false"></app-task-form>
      </div>
    </div>
  </div>

  <!-- Edit Task Modal -->
  <div *ngIf="editingTask" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.55)">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 rounded-3 shadow">
        <app-task-form [task]="editingTask" [editMode]="true" [users]="allUsers"
          (onSave)="updateTask($event)" (onCancel)="editingTask=null" (onDelete)="deleteTask($event)">
        </app-task-form>
      </div>
    </div>
  </div>

  <!-- Task Detail Modal (comments) -->
  <div *ngIf="detailTask" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.55)">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content border-0 rounded-3 shadow">
        <!-- Header -->
        <div class="p-3 text-white rounded-top" style="background:#1E3A5F">
          <div class="d-flex justify-content-between">
            <span class="fw-bold">Task Detail — {{detailTask.title}}</span>
            <button class="btn-close btn-close-white" (click)="detailTask=null"></button>
          </div>
        </div>
        <div class="row g-0">
          <!-- Left: task info -->
          <div class="col-md-6 p-4 border-end">
            <div class="mb-3">
              <div class="small fw-bold text-uppercase text-muted mb-1" style="letter-spacing:.06em">Title</div>
              <div class="fw-bold" style="font-size:1rem" [style.color]="getDueState(detailTask)==='overdue'?'#DC2626':'#1E293B'">
                {{detailTask.title}}
              </div>
            </div>
            <div class="mb-3">
              <div class="small fw-bold text-uppercase text-muted mb-1">Description</div>
              <div class="small text-muted">{{detailTask.description || 'No description provided.'}}</div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <div class="small fw-bold text-uppercase text-muted mb-1">Status</div>
                <span class="badge rounded-pill" [ngClass]="getStatusBadgeClass(detailTask.status)">{{getStatusLabel(detailTask.status)}}</span>
              </div>
              <div class="col-6">
                <div class="small fw-bold text-uppercase text-muted mb-1">Priority</div>
                <span class="badge rounded-pill" [ngClass]="getPriorityBadgeClass(detailTask.priority)">{{detailTask.priority}}</span>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <div class="small fw-bold text-uppercase text-muted mb-1">Due Date</div>
                <div class="small p-2 rounded" style="background:#F8FAFC;border:1px solid #E2E8F0">{{detailTask.dueDate}}</div>
              </div>
              <div class="col-6">
                <div class="small fw-bold text-uppercase text-muted mb-1">Assigned To</div>
                <div class="small p-2 rounded" style="background:#F8FAFC;border:1px solid #E2E8F0">
                  {{detailTask.assignee?.fullName || 'Unassigned'}}
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm fw-bold" style="background:#2563EB;border-color:#2563EB"
              (click)="openEdit(detailTask); detailTask=null">Edit Task</button>
          </div>
          <!-- Right: comments -->
          <div class="col-md-6 p-4 d-flex flex-column" style="min-height:400px">
            <div class="fw-bold mb-3" style="font-size:.9rem">Comments</div>
            <div class="flex-fill overflow-auto mb-3" style="max-height:280px">
              <div *ngIf="taskComments.length===0" class="text-center text-muted small py-4">No comments yet.</div>
              <div *ngFor="let c of taskComments; let i=index" class="d-flex gap-2"
                [class.mt-3]="i>0" [class.pt-3]="i>0" [class.border-top]="i>0">
                <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                  style="width:30px;height:30px;font-size:.65rem;background:#2563EB">
                  {{getInitials(c.author.fullName)}}
                </div>
                <div class="flex-fill">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold" style="font-size:.78rem">{{c.author.fullName}}</span>
                    <div class="d-flex align-items-center gap-2">
                      <span class="text-muted" style="font-size:.68rem">{{c.createdAt | relativeTime}}</span>
                      <button *ngIf="c.author.id === currentUserId" class="btn btn-link p-0 text-danger"
                        style="font-size:.75rem;text-decoration:none" (click)="deleteComment(c.id)">🗑</button>
                    </div>
                  </div>
                  <div style="font-size:.78rem;color:#1E293B;line-height:1.5">{{c.body}}</div>
                </div>
              </div>
            </div>
            <div class="border-top pt-3">
              <textarea class="form-control form-control-sm mb-2" [(ngModel)]="newComment" rows="2"
                placeholder="Add a comment..."></textarea>
              <button class="btn btn-primary btn-sm fw-bold float-end"
                style="background:#2563EB;border-color:#2563EB"
                [disabled]="!newComment.trim()"
                (click)="postComment()">Post Comment</button>
              <div class="clearfix"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>
  `
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  allUsers: User[] = [];
  activityFeed: ActivityEntry[] = [];
  taskComments: Comment[] = [];
  summary: TaskSummary | null = null;

  activeFilter: FilterTab = 'ALL';
  searchTerm = '';
  sortByPriority = false;
  showAnalytics = false;
  alertDismissed = false;

  showCreateModal = false;
  editingTask: Task | null = null;
  detailTask: Task | null = null;

  newComment = '';
  currentUserId: number | null = null;

  filterTabs = [
    { key: 'ALL' as FilterTab,            label: 'All Tasks'       },
    { key: 'TODO' as FilterTab,           label: 'To-Do'           },
    { key: 'IN_PROGRESS' as FilterTab,    label: 'In Progress'     },
    { key: 'DONE' as FilterTab,           label: 'Done'            },
    { key: 'ASSIGNED_TO_ME' as FilterTab, label: 'Assigned to Me'  },
  ];

  get stats() {
    return [
      { label: 'Total Tasks',  value: this.tasks.length,                                    color: '#1E3A5F' },
      { label: 'To-Do',        value: this.tasks.filter(t=>t.status==='TODO').length,        color: '#2563EB' },
      { label: 'In Progress',  value: this.tasks.filter(t=>t.status==='IN_PROGRESS').length, color: '#F59E0B' },
      { label: 'Done',         value: this.tasks.filter(t=>t.status==='DONE').length,        color: '#22C55E' },
    ];
  }

  get overdueCount(): number { return this.tasks.filter(t => this.getDueState(t) === 'overdue').length; }
  get dueTodayCount(): number { return this.tasks.filter(t => this.getDueState(t) === 'today').length; }

  get kpis() {
    if (!this.summary) return [];
    return [
      { label:'Completion Rate', value: this.summary.completionRate + '%', color:'#2563EB' },
      { label:'Overdue Tasks',   value: this.summary.overdueCount,         color:'#EF4444' },
      { label:'Due Today',       value: this.dueTodayCount,                color:'#F59E0B' },
      { label:'This Week',       value: this.summary.tasksThisWeek,        color:'#7C3AED' },
      { label:'Total Tasks',     value: this.summary.totalTasks,           color:'#1E3A5F' },
    ];
  }

  get statusBreakdown() {
    if (!this.summary) return [];
    return [
      { label:'To-Do',       count: this.summary.todo,       color:'#2563EB' },
      { label:'In Progress', count: this.summary.inProgress, color:'#F59E0B' },
      { label:'Done',        count: this.summary.done,       color:'#22C55E' },
    ];
  }

  get priorityBreakdown() {
    if (!this.summary) return [];
    return [
      { label:'High',   count: this.summary.high,   color:'#EF4444' },
      { label:'Medium', count: this.summary.medium, color:'#F59E0B' },
      { label:'Low',    count: this.summary.low,    color:'#22C55E' },
    ];
  }

  constructor(
    private taskService: TaskService,
    private commentService: CommentService,
    private activityService: ActivityService,
    private userListService: UserListService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.auth.getCurrentUser()?.id ?? null;
    this.loadTasks();
    this.loadActivity();
    this.userListService.getUsers().subscribe(u => this.allUsers = u);
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(t => { this.tasks = t; this.applyFilter(); });
  }

  loadActivity(): void {
    this.activityService.getActivityFeed().subscribe(a => this.activityFeed = a);
  }

  loadAnalytics(): void {
    this.showAnalytics = true;
    this.taskService.getSummary().subscribe(s => this.summary = s);
  }

  applyFilter(): void {
    let result = [...this.tasks];
    if (this.activeFilter === 'TODO') result = result.filter(t => t.status === 'TODO');
    else if (this.activeFilter === 'IN_PROGRESS') result = result.filter(t => t.status === 'IN_PROGRESS');
    else if (this.activeFilter === 'DONE') result = result.filter(t => t.status === 'DONE');
    else if (this.activeFilter === 'ASSIGNED_TO_ME') result = result.filter(t => t.assignee?.id === this.currentUserId);

    if (this.searchTerm.trim()) {
      result = result.filter(t => t.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    if (this.sortByPriority) {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      result.sort((a, b) => {
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return a.dueDate < b.dueDate ? -1 : 1;
      });
    }

    this.filteredTasks = result;
  }

  toggleSort(): void { this.sortByPriority = !this.sortByPriority; this.applyFilter(); }

  openCreate(): void { this.showCreateModal = true; }
  openEdit(task: Task): void { this.editingTask = { ...task }; }

  openDetail(task: Task): void {
    this.detailTask = task;
    this.commentService.getComments(task.id).subscribe(c => this.taskComments = c);
  }

  createTask(data: any): void {
    const req = { title: data.title, description: data.description, dueDate: data.dueDate,
      status: data.status, priority: data.priority, assignedTo: data.assignedTo || null };
    this.taskService.createTask(req).subscribe(() => { this.showCreateModal = false; this.loadTasks(); this.loadActivity(); });
  }

  updateTask(data: any): void {
    const req = { title: data.title, description: data.description, dueDate: data.dueDate,
      status: data.status, priority: data.priority, assignedTo: data.assignedTo || null };
    this.taskService.updateTask(data.id, req).subscribe(() => { this.editingTask = null; this.loadTasks(); this.loadActivity(); });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(() => { this.editingTask = null; this.detailTask = null; this.loadTasks(); this.loadActivity(); });
  }

  confirmDelete(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.deleteTask(task.id);
    }
  }

  postComment(): void {
    if (!this.detailTask || !this.newComment.trim()) return;
    this.commentService.addComment(this.detailTask.id, this.newComment).subscribe(c => {
      this.taskComments.push(c);
      this.newComment = '';
      this.loadActivity();
    });
  }

  deleteComment(id: number): void {
    this.commentService.deleteComment(id).subscribe(() => {
      this.taskComments = this.taskComments.filter(c => c.id !== id);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  getDueState(task: Task): 'overdue' | 'today' | 'done' | 'upcoming' {
    if (task.status === 'DONE') return 'done';
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(task.dueDate + 'T00:00:00');
    if (due.getTime() === today.getTime()) return 'today';
    if (due < today) return 'overdue';
    return 'upcoming';
  }

  getDueBorderColor(task: Task): string {
    return { overdue:'#EF4444', today:'#F59E0B', done:'#22C55E', upcoming:'#E2E8F0' }[this.getDueState(task)];
  }

  getDueLabelClass(task: Task): string {
    const s = this.getDueState(task);
    if (s === 'overdue') return 'text-danger fw-semibold';
    if (s === 'today') return 'fw-semibold' ;
    return 'text-muted';
  }

  getStatusBadgeClass(status: string): string {
    return { TODO:'', IN_PROGRESS:'', DONE:'' }[status] || '';
  }

  getStatusLabel(status: string): string {
    return { TODO:'To-Do', IN_PROGRESS:'In Progress', DONE:'Done' }[status] || status;
  }

  getPriorityBadgeClass(priority: string): string { return ''; }

  getStatusBadgeStyle(status: string): object {
    const s: Record<string,object> = {
      TODO:        { background:'#EFF6FF', color:'#2563EB', border:'1px solid #BFDBFE' },
      IN_PROGRESS: { background:'#FFFBEB', color:'#D97706', border:'1px solid #FCD34D' },
      DONE:        { background:'#F0FDF4', color:'#16A34A', border:'1px solid #86EFAC' },
    };
    return s[status] || {};
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  }

  getActivityIcon(code: string): string {
    return { COMMENT_ADDED:'💬', TASK_STATUS_CHANGED:'🔄', TASK_ASSIGNED:'👤',
             TASK_CREATED:'✅', TASK_PRIORITY_CHANGED:'🔺', TASK_DELETED:'🗑️' }[code] || '•';
  }

  getActivityBgColor(code: string): string {
    return { COMMENT_ADDED:'#DBEAFE', TASK_STATUS_CHANGED:'#FEF3C7', TASK_ASSIGNED:'#EDE9FE',
             TASK_CREATED:'#DCFCE7', TASK_PRIORITY_CHANGED:'#FEE2E2', TASK_DELETED:'#F1F5F9' }[code] || '#F1F5F9';
  }
}
