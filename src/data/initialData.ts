import type { Project, AppState } from '../types';

export const PROJECTS: Project[] = [
  { id: 'darom-galilot', name: 'דרום גלילות', color: '#3B82F6' },
  { id: 'beit-halohem', name: 'בית הלוחם', color: '#EF4444' },
  { id: 'kanyon-ir-yamim', name: 'קניון עיר ימים', color: '#10B981' },
  { id: 'ramot-hana', name: 'רמות חנה', color: '#F59E0B' },
  { id: 'kirui-ayalon', name: 'קירוי איילון', color: '#8B5CF6' },
  { id: 'lev-neve-sharet', name: 'לב נווה שרת', color: '#EC4899' },
  { id: 'kikar-noga', name: 'כיכר נגה', color: '#06B6D4' },
];

export const STATUS_LABELS: Record<string, string> = {
  todo: 'לביצוע',
  in_progress: 'בתהליך',
  done: 'הושלם',
  blocked: 'חסום',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין',
  submitted: 'הוגש',
  approved: 'אושר',
  paid: 'שולם',
};

export const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  paid: 'bg-blue-100 text-blue-700',
};

export const initialData: AppState = {
  projects: PROJECTS,
  tasks: [],
  monthlyPlanItems: [],
  milestones: [],
  invoices: [],
};
