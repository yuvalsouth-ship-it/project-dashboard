export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type InvoiceStatus = 'pending' | 'submitted' | 'approved' | 'paid';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  due_date: string | null;
  notes: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyPlanItem {
  id: string;
  project_id: string;
  year: number;
  month: number;
  activity: string;
  responsible: string;
  completed: boolean;
  order_index: number;
}

export interface WeeklyEvent {
  id: string;
  project_id: string;
  event_date: string;
  event_time: string;
  title: string;
  notes: string;
  order_index: number;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  category: string;
  start_date: string;
  end_date: string;
  color: string;
  completed: boolean;
  order_index: number;
}

export interface Invoice {
  id: string;
  project_id: string;
  consultant_name: string;
  submission_date: string | null;
  status: InvoiceStatus;
  notes: string;
  updated_at: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  monthlyPlanItems: MonthlyPlanItem[];
  weeklyEvents: WeeklyEvent[];
  milestones: Milestone[];
  invoices: Invoice[];
}
