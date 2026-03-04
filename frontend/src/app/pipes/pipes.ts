import { Pipe, PipeTransform } from '@angular/core';

/** F-EXT-06 — returns 'overdue' | 'today' | 'done' | 'upcoming' */
@Pipe({ name: 'taskDueDate', standalone: true })
export class TaskDueDatePipe implements PipeTransform {
  transform(dueDate: string, status: string): 'overdue' | 'today' | 'done' | 'upcoming' {
    if (status === 'DONE') return 'done';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    if (due.getTime() === today.getTime()) return 'today';
    if (due < today) return 'overdue';
    return 'upcoming';
  }
}

/** F-EXT-05 — converts ISO timestamp to relative string */
@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string): string {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
