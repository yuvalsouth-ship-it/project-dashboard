import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useStore } from '../../../store/useStore';

interface Props {
  projectId: string;
}

export default function MonthlyPlanSection({ projectId }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const allPlanItems = useStore((s) => s.monthlyPlanItems);
  const items = useMemo(
    () => allPlanItems.filter(
      (item) => item.project_id === projectId && item.year === year && item.month === month
    ),
    [allPlanItems, projectId, year, month]
  );
  const addPlanItem = useStore((s) => s.addPlanItem);
  const updatePlanItem = useStore((s) => s.updatePlanItem);
  const deletePlanItem = useStore((s) => s.deletePlanItem);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const monthLabel = format(new Date(year, month - 1), 'MMMM yyyy', { locale: he });

  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const handleAdd = () => {
    if (!newActivity.trim()) return;
    addPlanItem({
      project_id: projectId,
      year,
      month,
      activity: newActivity.trim(),
      responsible: newResponsible.trim(),
      completed: false,
      order_index: items.length,
    });
    setNewActivity('');
    setNewResponsible('');
    setShowAddForm(false);
  };

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    updatePlanItem(editingCell.id, { [editingCell.field]: editValue });
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

  return (
    <div className="p-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={goPrev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 min-w-[160px] text-center">{monthLabel}</h3>
          <button onClick={goNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>פעילות חדשה</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 w-[5%]"></th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[50%]">פעילות</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[25%]">אחראי</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {showAddForm && (
              <tr className="border-b border-gray-100 bg-blue-50/50">
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="תיאור הפעילות..."
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="אחראי..."
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      הוסף
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                    >
                      ביטול
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => updatePlanItem(item.id, { completed: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  {editingCell?.id === item.id && editingCell.field === 'activity' ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(item.id, 'activity', item.activity)}
                      className={`text-sm cursor-pointer hover:text-blue-600 ${
                        item.completed ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {item.activity}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingCell?.id === item.id && editingCell.field === 'responsible' ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(item.id, 'responsible', item.responsible)}
                      className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                    >
                      {item.responsible || <span className="text-gray-300">ללא</span>}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deletePlanItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && !showAddForm && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                  אין פעילויות מתוכננות לחודש זה. הוסף פעילות חדשה!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
