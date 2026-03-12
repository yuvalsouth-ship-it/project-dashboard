import { useState, useMemo } from 'react';
import { Plus, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { he } from 'date-fns/locale';
import { useStore } from '../../../store/useStore';
import GanttChart from './GanttChart';
import type { Milestone } from '../../../types';

interface Props {
  projectId: string;
  color: string;
}

export default function GanttSection({ projectId, color }: Props) {
  const allMilestones = useStore((s) => s.milestones);
  const milestones = useMemo(
    () => allMilestones
      .filter((m) => m.project_id === projectId)
      .sort((a, b) => a.order_index - b.order_index),
    [allMilestones, projectId]
  );
  const addMilestone = useStore((s) => s.addMilestone);
  const updateMilestone = useStore((s) => s.updateMilestone);
  const deleteMilestone = useStore((s) => s.deleteMilestone);

  // Gantt range: 3 months starting from current month
  const now = new Date();
  const [rangeStart, setRangeStart] = useState(new Date(now.getFullYear(), now.getMonth()));
  const [numMonths] = useState(3);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    start_date: '',
    end_date: '',
  });

  // Get unique categories for autocomplete
  const categories = useMemo(
    () => [...new Set(milestones.map((m) => m.category).filter(Boolean))],
    [milestones]
  );

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) return;

    if (editingId) {
      updateMilestone(editingId, {
        title: formData.title.trim(),
        category: formData.category.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
      setEditingId(null);
    } else {
      addMilestone({
        project_id: projectId,
        title: formData.title.trim(),
        category: formData.category.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        color: color,
        completed: false,
        order_index: milestones.length,
      });
    }

    setFormData({ title: '', category: '', start_date: '', end_date: '' });
    setShowForm(false);
  };

  const startEdit = (milestone: Milestone) => {
    setFormData({
      title: milestone.title,
      category: milestone.category || '',
      start_date: milestone.start_date,
      end_date: milestone.end_date,
    });
    setEditingId(milestone.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', category: '', start_date: '', end_date: '' });
  };

  const rangeLabel = `${format(rangeStart, 'MMMM', { locale: he })} - ${format(addMonths(rangeStart, numMonths - 1), 'MMMM yyyy', { locale: he })}`;

  return (
    <div className="p-6">
      {/* Header with range navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setRangeStart(subMonths(rangeStart, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
          <h3 className="text-sm font-bold text-gray-700 min-w-[200px] text-center">{rangeLabel}</h3>
          <button onClick={() => setRangeStart(addMonths(rangeStart, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <span className="text-xs text-gray-400 mr-2">{milestones.length} משימות</span>
        </div>
        <button
          onClick={() => { cancelForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: color }}
        >
          <Plus size={16} />
          <span>משימה חדשה</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border-2 p-4 mb-4 shadow-lg" style={{ borderColor: color }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700">
              {editingId ? 'עריכת משימה' : 'משימה חדשה'}
            </h4>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">שם המשימה</label>
              <input
                autoFocus
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="תיאור המשימה..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">קטגוריה</label>
              <input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="לדוגמה: תנועה, תשתיות, תיאומים..."
                list="categories-list"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="categories-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">תאריך התחלה</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">תאריך סיום</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white text-sm rounded-lg hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              {editingId ? 'עדכן' : 'הוסף'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300">
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      {milestones.length > 0 ? (
        <GanttChart
          milestones={milestones}
          rangeStart={rangeStart}
          numMonths={numMonths}
          projectColor={color}
          onEdit={startEdit}
          onToggleComplete={(id, completed) => updateMilestone(id, { completed })}
          onDelete={deleteMilestone}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          אין משימות עדיין. הוסף משימה חדשה!
        </div>
      )}
    </div>
  );
}
