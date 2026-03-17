import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { ExtractedTask } from '../../../lib/aiExtractTasks';

interface Props {
  tasks: ExtractedTask[];
  onConfirm: (tasks: ExtractedTask[]) => void;
  onCancel: () => void;
}

export default function TaskPreviewDialog({ tasks: initialTasks, onConfirm, onCancel }: Props) {
  const [tasks, setTasks] = useState<ExtractedTask[]>(initialTasks);

  const updateTask = (index: number, field: keyof ExtractedTask, value: string | null) => {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            משימות שחולצו מהמסמך ({tasks.length})
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[35%]">כותרת</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[15%]">אחראי</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[12%]">תאריך יעד</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[33%]">הערות</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      className="w-full bg-transparent border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={task.assignee}
                      onChange={(e) => updateTask(index, 'assignee', e.target.value)}
                      placeholder="ללא"
                      className="w-full bg-transparent border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      value={task.due_date || ''}
                      onChange={(e) => updateTask(index, 'due_date', e.target.value || null)}
                      className="w-full bg-transparent border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={task.notes}
                      onChange={(e) => updateTask(index, 'notes', e.target.value)}
                      placeholder="הערה..."
                      className="w-full bg-transparent border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeTask(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={() => onConfirm(tasks)}
            disabled={tasks.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Check size={16} />
            <span>הוסף {tasks.length} משימות</span>
          </button>
        </div>
      </div>
    </div>
  );
}
