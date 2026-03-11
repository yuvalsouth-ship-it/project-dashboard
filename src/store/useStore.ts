import { create } from 'zustand';
import type { AppState, Task, MonthlyPlanItem, Milestone, Invoice } from '../types';
import { initialData } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppActions {
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addPlanItem: (item: Omit<MonthlyPlanItem, 'id'>) => void;
  updatePlanItem: (id: string, updates: Partial<MonthlyPlanItem>) => void;
  deletePlanItem: (id: string) => void;

  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id' | 'updated_at'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  loadFromSupabase: () => Promise<void>;
}

const STORAGE_KEY = 'project-dashboard-storage';

function loadFromLocalStorage(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tasks: parsed.tasks ?? [],
        monthlyPlanItems: parsed.monthlyPlanItems ?? [],
        milestones: parsed.milestones ?? [],
        invoices: parsed.invoices ?? [],
      };
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return {};
}

function saveToLocalStorage(state: AppState) {
  try {
    const data = {
      tasks: state.tasks,
      monthlyPlanItems: state.monthlyPlanItems,
      milestones: state.milestones,
      invoices: state.invoices,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

const syncToSupabase = async (table: string, action: string, data: Record<string, unknown>) => {
  if (!isSupabaseConfigured()) return;
  try {
    if (action === 'insert') {
      await supabase.from(table).insert(data);
    } else if (action === 'update') {
      const { id, ...rest } = data;
      await supabase.from(table).update(rest).eq('id', id);
    } else if (action === 'delete') {
      await supabase.from(table).delete().eq('id', data.id);
    }
  } catch (e) {
    console.error(`Supabase sync error (${table}/${action}):`, e);
  }
};

const savedData = loadFromLocalStorage();

export const useStore = create<AppState & AppActions>()((set, get) => ({
    ...initialData,
    ...savedData,

    // === TASKS ===
    addTask: (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      syncToSupabase('tasks', 'insert', newTask as unknown as Record<string, unknown>);
    },

    updateTask: (id, updates) => {
      const updatedFields = { ...updates, updated_at: new Date().toISOString() };
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)),
      }));
      syncToSupabase('tasks', 'update', { id, ...updatedFields } as Record<string, unknown>);
    },

    deleteTask: (id) => {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      syncToSupabase('tasks', 'delete', { id });
    },

    // === MONTHLY PLAN ===
    addPlanItem: (itemData) => {
      const newItem: MonthlyPlanItem = { ...itemData, id: crypto.randomUUID() };
      set((state) => ({ monthlyPlanItems: [...state.monthlyPlanItems, newItem] }));
      syncToSupabase('monthly_plan_items', 'insert', newItem as unknown as Record<string, unknown>);
    },

    updatePlanItem: (id, updates) => {
      set((state) => ({
        monthlyPlanItems: state.monthlyPlanItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
      syncToSupabase('monthly_plan_items', 'update', { id, ...updates } as Record<string, unknown>);
    },

    deletePlanItem: (id) => {
      set((state) => ({ monthlyPlanItems: state.monthlyPlanItems.filter((item) => item.id !== id) }));
      syncToSupabase('monthly_plan_items', 'delete', { id });
    },

    // === MILESTONES ===
    addMilestone: (milestoneData) => {
      const newMilestone: Milestone = { ...milestoneData, id: crypto.randomUUID() };
      set((state) => ({ milestones: [...state.milestones, newMilestone] }));
      syncToSupabase('milestones', 'insert', newMilestone as unknown as Record<string, unknown>);
    },

    updateMilestone: (id, updates) => {
      set((state) => ({
        milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }));
      syncToSupabase('milestones', 'update', { id, ...updates } as Record<string, unknown>);
    },

    deleteMilestone: (id) => {
      set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
      syncToSupabase('milestones', 'delete', { id });
    },

    // === INVOICES ===
    addInvoice: (invoiceData) => {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ invoices: [...state.invoices, newInvoice] }));
      syncToSupabase('invoices', 'insert', newInvoice as unknown as Record<string, unknown>);
    },

    updateInvoice: (id, updates) => {
      const updatedFields = { ...updates, updated_at: new Date().toISOString() };
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updatedFields } : inv)),
      }));
      syncToSupabase('invoices', 'update', { id, ...updatedFields } as Record<string, unknown>);
    },

    deleteInvoice: (id) => {
      set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
      syncToSupabase('invoices', 'delete', { id });
    },

    // === SUPABASE LOAD ===
    loadFromSupabase: async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const [tasksRes, planRes, milestonesRes, invoicesRes] = await Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('monthly_plan_items').select('*'),
          supabase.from('milestones').select('*'),
          supabase.from('invoices').select('*'),
        ]);

        set({
          tasks: tasksRes.data || get().tasks,
          monthlyPlanItems: planRes.data || get().monthlyPlanItems,
          milestones: milestonesRes.data || get().milestones,
          invoices: invoicesRes.data || get().invoices,
        });
      } catch (e) {
        console.error('Failed to load from Supabase:', e);
      }
    },
  }));

// Auto-save to localStorage on any state change
useStore.subscribe((state) => {
  saveToLocalStorage(state);
});
