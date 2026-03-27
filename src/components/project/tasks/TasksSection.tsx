import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../../data/initialData';
import type { TaskStatus } from '../../../types';
import type { ExtractedTask } from '../../../lib/aiExtractTasks';
import PdfUploadButton from './PdfUploadButton';
import TaskPreviewDialog from './TaskPreviewDialog';

interface Props {
  projectId: string;
}

export default function TasksSection({ projectId }: Props) {
  const allTasks = useStore((s) => s.tasks);
  const tasks = useMemo(() => allTasks.filter((t) => t.project_id === projectId), [allTasks, projectId]);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [filter, setFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [previewTasks, setPreviewTasks] = useState<ExtractedTask[] | null>(null);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({
      project_id: projectId,
      title: newTitle.trim(),
      status: 'todo',
      assignee: newAssignee.trim(),
      due_date: newDueDate || null,
      notes: '',
      order_index: tasks.length,
    });
    setNewTitle('');
    setNewAssignee('');
    setNewDueDate('');
    setShowAddForm(false);
  };

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    updateTask(editingCell.id, { [editingCell.field]: editValue });
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const handleConfirmImport = (importedTasks: ExtractedTask[]) => {
    importedTasks.forEach((task, i) => {
      addTask({
        project_id: projectId,
        title: task.title,
        status: 'todo',
        assignee: task.assignee,
        due_date: task.due_date,
        notes: task.notes,
        order_index: tasks.length + i,
      });
    });
    setPreviewTasks(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div className="flex flex-wrap gap-2">
          {['all', 'todo', 'in_progress', 'done', 'blocked'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'הכל' : STATUS_LABELS[s]}
              {s !== 'all' && (
                <span className="mr-1">({tasks.filter((t) => t.status === s).length})</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <PdfUploadButton onTasksExtracted={setPreviewTasks} />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>משימה חדשה</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[30%]">משימה</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[12%]">דחיפות</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[15%]">אחראי</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[13%]">תאריך יעד</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[25%]">הערות</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {showAddForm && (
              <tr className="border-b border-gray-100 bg-blue-50/50">
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="כותרת המשימה..."
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs text-gray-400">לביצוע</span>
                </td>
                <td className="px-4 py-2">
                  <input
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="אחראי..."
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2" colSpan={2}>
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

            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Title */}
                <td className="px-4 py-3">
                  {editingCell?.id === task.id && editingCell.field === 'title' ? (
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
                      onClick={() => startEdit(task.id, 'title', task.title)}
                      className={`text-sm cursor-pointer hover:text-blue-600 ${
                        task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {task.title}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className="relative">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                      className={`appearance-none text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer border-0 ${STATUS_COLORS[task.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </td>

                {/* Assignee */}
                <td className="px-4 py-3">
                  {editingCell?.id === task.id && editingCell.field === 'assignee' ? (
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
                      onClick={() => startEdit(task.id, 'assignee', task.assignee)}
                      className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                    >
                      {task.assignee || <span className="text-gray-300">ללא</span>}
                    </span>
                  )}
                </td>

                {/* Due Date */}
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={task.due_date || ''}
                    onChange={(e) => updateTask(task.id, { due_date: e.target.value || null })}
                    className={`text-sm bg-transparent border-0 cursor-pointer ${
                      isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}
                  />
                </td>

                {/* Notes */}
                <td className="px-4 py-3">
                  {editingCell?.id === task.id && editingCell.field === 'notes' ? (
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
                      onClick={() => startEdit(task.id, 'notes', task.notes)}
                      className="text-sm text-gray-500 cursor-pointer hover:text-blue-600 truncate block max-w-[200px]"
                    >
                      {task.notes || <span className="text-gray-300">הוסף הערה...</span>}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredTasks.length === 0 && !showAddForm && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  {tasks.length === 0 ? 'אין משימות עדיין. הוסף משימה חדשה!' : 'אין משימות בסינון הנוכחי'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewTasks && (
        <TaskPreviewDialog
          tasks={previewTasks}
          onConfirm={handleConfirmImport}
          onCancel={() => setPreviewTasks(null)}
        />
      )}
    </div>
  );
}
