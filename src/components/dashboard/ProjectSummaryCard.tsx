import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import type { Project } from '../../types';
import { useStore } from '../../store/useStore';

interface Props {
  project: Project;
}

export default function ProjectSummaryCard({ project }: Props) {
  const navigate = useNavigate();
  const allTasks = useStore((s) => s.tasks);
  const allInvoices = useStore((s) => s.invoices);

  const tasks = useMemo(() => allTasks.filter((t) => t.project_id === project.id), [allTasks, project.id]);
  const invoices = useMemo(() => allInvoices.filter((i) => i.project_id === project.id), [allInvoices, project.id]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length;
  const openInvoices = invoices.filter((i) => i.status !== 'paid').length;

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      <div className="h-2" style={{ backgroundColor: project.color }} />
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ListTodo size={16} className="text-gray-400" />
            <span>{total} משימות</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 size={16} />
            <span>{done} הושלמו</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock size={16} />
            <span>{inProgress} בתהליך</span>
          </div>
          {overdue > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle size={16} />
              <span>{overdue} באיחור</span>
            </div>
          )}
        </div>

        {openInvoices > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{openInvoices} חשבונות פתוחים</span>
          </div>
        )}

        {total > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(done / total) * 100}%`,
                  backgroundColor: project.color,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{Math.round((done / total) * 100)}% הושלם</p>
          </div>
        )}
      </div>
    </div>
  );
}
