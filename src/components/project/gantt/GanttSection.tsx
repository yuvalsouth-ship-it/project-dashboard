import { useState, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import GanttChart from './GanttChart';
import type { Milestone } from '../../../types';

interface Props {
  projectId: string;
  color: string;
}

const MILESTONE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

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

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    color: color,
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) return;

    if (editingId) {
      updateMilestone(editingId, {
        title: formData.title.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        color: formData.color,
      });
      setEditingId(null);
    } else {
      addMilestone({
        project_id: projectId,
        title: formData.title.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        color: formData.color,
        completed: false,
        order_index: milestones.length,
      });
    }

    setFormData({ title: '', start_date: '', end_date: '', color });
    setShowForm(false);
  };

  const startEdit = (milestone: Milestone) => {
    setFormData({
      title: milestone.title,
      start_date: milestone.start_date,
      end_date: milestone.end_date,
      color: milestone.color,
    });
    setEditingId(milestone.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', start_date: '', end_date: '', color });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{milestones.length} אבני דרך</h3>
        <button
          onClick={() => { cancelForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>אבן דרך חדשה</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              {editingId ? 'עריכת אבן דרך' : 'אבן דרך חדשה'}
            </h4>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">כותרת</label>
              <input
                autoFocus
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="שם אבן הדרך..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            <div>
              <label className="text-xs text-gray-500 mb-1 block">צבע</label>
              <div className="flex items-center gap-1.5 mt-1">
                {MILESTONE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-6 h-6 rounded-full transition-all ${
                      formData.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'עדכן' : 'הוסף'}
            </button>
            <button
              onClick={cancelForm}
              className="px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      {milestones.length > 0 ? (
        <GanttChart
          milestones={milestones}
          onEdit={startEdit}
          onToggleComplete={(id, completed) => updateMilestone(id, { completed })}
          onDelete={deleteMilestone}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          אין אבני דרך עדיין. הוסף אבן דרך חדשה!
        </div>
      )}
    </div>
  );
}
