import { useMemo } from 'react';
import { format, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, addMonths, subMonths } from 'date-fns';
import { he } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import type { Milestone } from '../../../types';

interface Props {
  milestones: Milestone[];
  onEdit: (milestone: Milestone) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export default function GanttChart({ milestones, onEdit, onToggleComplete, onDelete }: Props) {
  const { months, rangeStart, totalDays } = useMemo(() => {
    const dates = milestones.flatMap((m) => [new Date(m.start_date), new Date(m.end_date)]);
    const minDate = subMonths(startOfMonth(new Date(Math.min(...dates.map((d) => d.getTime())))), 1);
    const maxDate = addMonths(endOfMonth(new Date(Math.max(...dates.map((d) => d.getTime())))), 1);

    const months = eachMonthOfInterval({ start: minDate, end: maxDate });
    const totalDays = differenceInDays(maxDate, minDate);

    return { months, rangeStart: minDate, totalDays };
  }, [milestones]);

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const offsetDays = differenceInDays(start, rangeStart);
    const durationDays = Math.max(differenceInDays(end, start), 1);

    const leftPercent = (offsetDays / totalDays) * 100;
    const widthPercent = (durationDays / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 1)}%`,
    };
  };

  const LABEL_WIDTH = 200;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header - Month labels */}
      <div className="flex border-b border-gray-200">
        <div className="shrink-0 border-l border-gray-200 bg-gray-50 px-4 py-2" style={{ width: LABEL_WIDTH }}>
          <span className="text-xs font-medium text-gray-500">אבן דרך</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-[600px]">
            {months.map((month, i) => (
              <div
                key={i}
                className="flex-1 text-center py-2 text-xs font-medium text-gray-500 border-l border-gray-100"
              >
                {format(month, 'MMM yy', { locale: he })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      {milestones.map((milestone) => (
        <div key={milestone.id} className="flex border-b border-gray-100 hover:bg-gray-50/50 group">
          {/* Label */}
          <div
            className="shrink-0 border-l border-gray-200 px-4 py-3 flex items-center justify-between gap-2"
            style={{ width: LABEL_WIDTH }}
          >
            <span className={`text-sm truncate ${milestone.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {milestone.title}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onToggleComplete(milestone.id, !milestone.completed)}
                className={`p-0.5 rounded ${milestone.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
              >
                <CheckCircle2 size={14} />
              </button>
              <button
                onClick={() => onEdit(milestone)}
                className="p-0.5 rounded text-gray-400 hover:text-blue-500"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(milestone.id)}
                className="p-0.5 rounded text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Bar area */}
          <div className="flex-1 overflow-x-auto">
            <div className="relative min-w-[600px] h-full min-h-[44px]">
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                {months.map((_, i) => (
                  <div key={i} className="flex-1 border-l border-gray-50" />
                ))}
              </div>

              {/* Bar */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-7 rounded-md transition-all cursor-pointer hover:opacity-80"
                style={{
                  ...getBarStyle(milestone.start_date, milestone.end_date),
                  backgroundColor: milestone.completed ? '#9CA3AF' : milestone.color,
                  opacity: milestone.completed ? 0.5 : 1,
                }}
                onClick={() => onEdit(milestone)}
                title={`${milestone.title}\n${milestone.start_date} - ${milestone.end_date}`}
              >
                <span className="text-xs text-white font-medium px-2 leading-7 truncate block">
                  {milestone.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
