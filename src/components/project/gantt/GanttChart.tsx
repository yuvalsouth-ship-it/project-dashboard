import { useMemo } from 'react';
import { format, startOfWeek, addWeeks, addMonths, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import { he } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import type { Milestone } from '../../../types';

interface Props {
  milestones: Milestone[];
  rangeStart: Date;
  numMonths: number;
  projectColor: string;
  onEdit: (milestone: Milestone) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

interface WeekColumn {
  weekStart: Date;
  weekNum: number;
  monthIdx: number;
}

interface MonthGroup {
  label: string;
  weekCount: number;
}

export default function GanttChart({ milestones, rangeStart, numMonths, projectColor, onEdit, onToggleComplete, onDelete }: Props) {
  // Calculate weeks for the range
  const { weeks, monthGroups } = useMemo(() => {
    const weeks: WeekColumn[] = [];
    const monthGroups: MonthGroup[] = [];

    for (let m = 0; m < numMonths; m++) {
      const monthDate = addMonths(rangeStart, m);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const label = format(monthDate, 'MMMM', { locale: he });

      let weekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      let weekCount = 0;

      while (isBefore(weekStart, monthEnd)) {
        weeks.push({
          weekStart,
          weekNum: weeks.length + 1,
          monthIdx: m,
        });
        weekCount++;
        weekStart = addWeeks(weekStart, 1);
      }
      monthGroups.push({ label, weekCount });
    }

    return { weeks, monthGroups };
  }, [rangeStart, numMonths]);

  // Group milestones by category
  const grouped = useMemo(() => {
    const groups: { category: string; items: Milestone[] }[] = [];
    const noCategory: Milestone[] = [];

    milestones.forEach((m) => {
      if (m.category) {
        const group = groups.find((g) => g.category === m.category);
        if (group) group.items.push(m);
        else groups.push({ category: m.category, items: [m] });
      } else {
        noCategory.push(m);
      }
    });

    // Put uncategorized items first
    const result: { category: string; items: Milestone[] }[] = [];
    if (noCategory.length > 0) result.push({ category: '', items: noCategory });
    result.push(...groups);
    return result;
  }, [milestones]);

  // Check if a task is active in a given week
  const isActiveInWeek = (milestone: Milestone, week: WeekColumn) => {
    const taskStart = new Date(milestone.start_date);
    const taskEnd = new Date(milestone.end_date);
    const weekEnd = addWeeks(week.weekStart, 1);

    // Task overlaps this week
    return !(isAfter(taskStart, weekEnd) || isBefore(taskEnd, week.weekStart));
  };

  // Check if this is the last active week (for showing "הושלם")
  const isLastWeek = (milestone: Milestone, week: WeekColumn, weekIdx: number) => {
    if (!isActiveInWeek(milestone, week)) return false;
    // Check if next week is NOT active
    if (weekIdx + 1 < weeks.length && isActiveInWeek(milestone, weeks[weekIdx + 1])) return false;
    return true;
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const LABEL_WIDTH = isMobile ? 180 : 280;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: `${LABEL_WIDTH + weeks.length * 60}px` }}>
        {/* Month headers */}
        <thead>
          <tr className="bg-gray-50">
            <th
              className="border-b border-l border-gray-200 px-3 py-2 text-right text-xs font-bold text-gray-500 sticky right-0 bg-gray-50 z-10"
              style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}
              rowSpan={2}
            >
              משימה
            </th>
            {monthGroups.map((mg, i) => (
              <th
                key={i}
                colSpan={mg.weekCount}
                className="border-b border-l border-gray-200 px-2 py-2 text-center text-xs font-bold text-gray-700"
              >
                {mg.label}
              </th>
            ))}
          </tr>
          {/* Week number headers */}
          <tr className="bg-gray-50/70">
            {weeks.map((week, i) => (
              <th
                key={i}
                className="border-b border-l border-gray-100 px-1 py-1.5 text-center text-[10px] text-gray-400 font-medium"
                style={{ minWidth: 60 }}
              >
                שבוע {week.weekNum}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.map((group, gIdx) => (
            <>
              {/* Category header row */}
              {group.category && (
                <tr key={`cat-${gIdx}`} className="bg-gray-100/60">
                  <td
                    className="px-3 py-2 text-sm font-bold text-gray-700 border-b border-l border-gray-200 sticky right-0 bg-gray-100/60 z-10"
                    colSpan={weeks.length + 1}
                  >
                    {group.category}
                  </td>
                </tr>
              )}
              {/* Task rows */}
              {group.items.map((milestone) => (
                <tr key={milestone.id} className="group hover:bg-gray-50/50 transition-colors">
                  {/* Task name */}
                  <td
                    className="px-3 py-2.5 border-b border-l border-gray-200 sticky right-0 bg-white group-hover:bg-gray-50/50 z-10"
                    style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm ${milestone.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {milestone.title}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => onToggleComplete(milestone.id, !milestone.completed)}
                          className={`p-1 rounded ${milestone.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                          title={milestone.completed ? 'בטל השלמה' : 'סמן כהושלם'}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button onClick={() => onEdit(milestone)} className="p-1 rounded text-gray-400 hover:text-blue-500" title="ערוך">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm('למחוק משימה זו?')) onDelete(milestone.id); }}
                          className="p-1 rounded text-gray-400 hover:text-red-500"
                          title="מחק"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  {/* Week cells */}
                  {weeks.map((week, wIdx) => {
                    const active = isActiveInWeek(milestone, week);
                    const isLast = isLastWeek(milestone, week, wIdx);
                    const bgColor = milestone.completed ? '#86efac' : projectColor;

                    return (
                      <td
                        key={wIdx}
                        className="border-b border-l border-gray-100 px-0 py-0 text-center"
                        style={{ minWidth: 60 }}
                      >
                        {active && (
                          <div
                            className="h-8 flex items-center justify-center text-[10px] font-medium text-white mx-0.5 rounded-sm"
                            style={{ backgroundColor: bgColor }}
                          >
                            {isLast && milestone.completed ? 'הושלם' : ''}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
