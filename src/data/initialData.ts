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

// Week start dates for Q1 2026 (used for ramot-hana Gantt)
// Week 1: Jan 5, Week 2: Jan 12, ..., Week 12: Mar 23
const W = (n: number) => {
  const d = new Date(2026, 0, 5 + (n - 1) * 7);
  return d.toISOString().slice(0, 10);
};
const WE = (n: number) => {
  const d = new Date(2026, 0, 5 + (n - 1) * 7 + 6);
  return d.toISOString().slice(0, 10);
};

const RAMOT_HANA_COLOR = '#F59E0B';

export const RAMOT_HANA_MILESTONES: Omit<import('../types').Milestone, 'id'>[] = [
  // עדכון מדידה
  { project_id: 'ramot-hana', title: 'עדכון מדידה (רקע מדידה, מדידה אנליטית מצב נכנס/ יוצא, עדכון מצב קיים, מדידת עצים)', category: 'עדכון מדידה', start_date: W(1), end_date: WE(4), color: RAMOT_HANA_COLOR, completed: true, order_index: 0 },
  { project_id: 'ramot-hana', title: 'תשריט מצב מוצע, בינוי - יישלח לאישור סופי של לשכת התכנון', category: 'עדכון מדידה', start_date: W(1), end_date: WE(1), color: RAMOT_HANA_COLOR, completed: true, order_index: 1 },
  { project_id: 'ramot-hana', title: 'אישור סופי לפרוגרמה מול לשכת התכנון', category: 'עדכון מדידה', start_date: W(1), end_date: WE(2), color: RAMOT_HANA_COLOR, completed: true, order_index: 2 },
  // טבלאות או"ח
  { project_id: 'ramot-hana', title: 'עריכת טבלאות או"ח', category: 'טבלאות או"ח', start_date: W(3), end_date: WE(6), color: RAMOT_HANA_COLOR, completed: false, order_index: 3 },
  { project_id: 'ramot-hana', title: 'תיאום ואישור רמ"י', category: 'טבלאות או"ח', start_date: W(5), end_date: WE(8), color: RAMOT_HANA_COLOR, completed: false, order_index: 4 },
  // תנועה
  { project_id: 'ramot-hana', title: 'עדכון נספח תנועה', category: 'תנועה', start_date: W(1), end_date: WE(1), color: RAMOT_HANA_COLOR, completed: true, order_index: 5 },
  { project_id: 'ramot-hana', title: 'סיום תיאום מול יועץ תנועה ועדה מחוזית', category: 'תנועה', start_date: W(2), end_date: WE(5), color: RAMOT_HANA_COLOR, completed: false, order_index: 6 },
  // איכות סביבה
  { project_id: 'ramot-hana', title: 'עריכת נספח שימור אקולוגי', category: 'איכות סביבה', start_date: W(1), end_date: WE(1), color: RAMOT_HANA_COLOR, completed: true, order_index: 7 },
  { project_id: 'ramot-hana', title: 'תיאום עם היועץ האקולוגי של לשכת התכנון', category: 'איכות סביבה', start_date: W(2), end_date: WE(4), color: RAMOT_HANA_COLOR, completed: false, order_index: 8 },
  { project_id: 'ramot-hana', title: 'עדכון דוח הצללות ורוחות ונספח סביבתי', category: 'איכות סביבה', start_date: W(1), end_date: WE(3), color: RAMOT_HANA_COLOR, completed: true, order_index: 9 },
  { project_id: 'ramot-hana', title: 'תיאום עם יועצת הסביבה של לשכת התכנון', category: 'איכות סביבה', start_date: W(3), end_date: WE(6), color: RAMOT_HANA_COLOR, completed: false, order_index: 10 },
  { project_id: 'ramot-hana', title: 'תיאום רט"ג', category: 'איכות סביבה', start_date: W(4), end_date: WE(8), color: RAMOT_HANA_COLOR, completed: false, order_index: 11 },
  // תשתיות מים ביוב ניקוז
  { project_id: 'ramot-hana', title: 'עדכון נספח ניקוז, נספח מים וביוב', category: 'תשתיות מים ביוב ניקוז', start_date: W(1), end_date: WE(2), color: RAMOT_HANA_COLOR, completed: true, order_index: 12 },
  { project_id: 'ramot-hana', title: 'תיאום עם תאגיד המים הגיחון', category: 'תשתיות מים ביוב ניקוז', start_date: W(3), end_date: WE(6), color: RAMOT_HANA_COLOR, completed: false, order_index: 13 },
  // סקר עצים
  { project_id: 'ramot-hana', title: 'עדכון סקר עצים', category: 'סקר עצים', start_date: W(1), end_date: WE(6), color: RAMOT_HANA_COLOR, completed: true, order_index: 14 },
  { project_id: 'ramot-hana', title: 'אישור פקיד היערות', category: 'סקר עצים', start_date: W(7), end_date: WE(10), color: RAMOT_HANA_COLOR, completed: false, order_index: 15 },
  // תיאומים
  { project_id: 'ramot-hana', title: 'תיאום חוזר עם רת"א', category: 'תיאומים', start_date: W(4), end_date: WE(8), color: RAMOT_HANA_COLOR, completed: false, order_index: 16 },
  { project_id: 'ramot-hana', title: 'תיאום חוזר עם משרד הביטחון', category: 'תיאומים', start_date: W(1), end_date: WE(5), color: RAMOT_HANA_COLOR, completed: true, order_index: 17 },
  { project_id: 'ramot-hana', title: 'הפקדת התכנית', category: 'תיאומים', start_date: W(9), end_date: WE(12), color: RAMOT_HANA_COLOR, completed: false, order_index: 18 },
];

export const initialData: AppState = {
  projects: PROJECTS,
  tasks: [],
  monthlyPlanItems: [],
  weeklyEvents: [],
  milestones: RAMOT_HANA_MILESTONES.map((m, i) => ({ ...m, id: `ramot-hana-ms-${i}` })),
  invoices: [],
};
