import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, X, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { he } from 'date-fns/locale';
import { useStore } from '../../../store/useStore';
import type { WeeklyEvent } from '../../../types';

interface Props {
  projectId: string;
  color: string;
}

const DAY_NAMES = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'"];

function getWeeksOfMonth(year: number, month: number) {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(new Date(year, month - 1));
  // Start from Sunday of the week containing the first day
  let weekStart = startOfWeek(firstDay, { weekStartsOn: 0 });
  const weeks: Date[][] = [];

  while (weekStart <= lastDay) {
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) { // Sun-Thu (5 work days)
      days.push(addDays(weekStart, i));
    }
    weeks.push(days);
    weekStart = addDays(weekStart, 7);
  }
  return weeks;
}

export default function MonthlyPlanSection({ projectId, color }: Props) {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth()));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const allEvents = useStore((s) => s.weeklyEvents);
  const events = useMemo(
    () => allEvents.filter((e) => e.project_id === projectId),
    [allEvents, projectId]
  );
  const addWeeklyEvent = useStore((s) => s.addWeeklyEvent);
  const updateWeeklyEvent = useStore((s) => s.updateWeeklyEvent);
  const deleteWeeklyEvent = useStore((s) => s.deleteWeeklyEvent);

  const [addingForDate, setAddingForDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<WeeklyEvent | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const weeks = useMemo(() => getWeeksOfMonth(year, month), [year, month]);
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: he });

  const goNext = () => setCurrentDate(addMonths(currentDate, 1));
  const goPrev = () => setCurrentDate(subMonths(currentDate, 1));

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e) => e.event_date === dateStr).sort((a, b) => {
      if (a.event_time && b.event_time) return a.event_time.localeCompare(b.event_time);
      return a.order_index - b.order_index;
    });
  };

  const openAddForm = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setAddingForDate(dateStr);
    setEditingEvent(null);
    setFormTitle('');
    setFormTime('');
    setFormNotes('');
  };

  const openEditForm = (event: WeeklyEvent) => {
    setEditingEvent(event);
    setAddingForDate(null);
    setFormTitle(event.title);
    setFormTime(event.event_time);
    setFormNotes(event.notes);
  };

  const closeForm = () => {
    setAddingForDate(null);
    setEditingEvent(null);
    setFormTitle('');
    setFormTime('');
    setFormNotes('');
  };

  const handleSubmit = () => {
    if (!formTitle.trim()) return;
    if (editingEvent) {
      updateWeeklyEvent(editingEvent.id, {
        title: formTitle.trim(),
        event_time: formTime.trim(),
        notes: formNotes.trim(),
      });
    } else if (addingForDate) {
      addWeeklyEvent({
        project_id: projectId,
        event_date: addingForDate,
        event_time: formTime.trim(),
        title: formTitle.trim(),
        notes: formNotes.trim(),
        order_index: events.length,
      });
    }
    closeForm();
  };

  const isFormOpen = addingForDate !== null || editingEvent !== null;

  return (
    <div className="p-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={goPrev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 min-w-[180px] text-center">{monthLabel}</h3>
          <button onClick={goNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(new Date(now.getFullYear(), now.getMonth()))}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          היום
        </button>
      </div>

      {/* Event Form Modal */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border-2 p-4 mb-4 shadow-lg" style={{ borderColor: color }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700">
              {editingEvent ? 'עריכת פגישה' : `פגישה חדשה - ${format(new Date(addingForDate || editingEvent!.event_date), 'EEEE, d MMMM', { locale: he })}`}
            </h4>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">נושא הפגישה</label>
              <input
                autoFocus
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="נושא הפגישה..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">שעה</label>
              <input
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="לדוגמה: 14:00 או 11:00-12:00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block">הערות / סדר יום</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="פירוט סדר היום..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSubmit} className="px-4 py-2 text-white text-sm rounded-lg hover:opacity-90" style={{ backgroundColor: color }}>
              {editingEvent ? 'עדכן' : 'הוסף'}
            </button>
            <button onClick={closeForm} className="px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300">
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
          {DAY_NAMES.map((day) => (
            <div key={day} className="px-3 py-2.5 text-center text-xs font-bold text-gray-500 border-l border-gray-200 first:border-l-0">
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-5 border-b border-gray-200 last:border-b-0">
            {week.map((day, dayIdx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, now);
              const dayEvents = getEventsForDate(day);

              return (
                <div
                  key={dayIdx}
                  className={`min-h-[100px] border-l border-gray-200 first:border-l-0 p-1.5 transition-colors cursor-pointer hover:bg-blue-50/30 ${
                    !isCurrentMonth ? 'bg-gray-50/50' : ''
                  } ${isToday ? 'bg-blue-50/50' : ''}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.event-card')) return;
                    openAddForm(day);
                  }}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' :
                      isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openAddForm(day); }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-gray-300 hover:text-blue-500"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>

                  {/* Events */}
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="event-card group/event rounded px-1.5 py-1 mb-1 text-xs cursor-pointer hover:shadow-sm transition-shadow relative"
                      style={{ backgroundColor: `${color}15`, borderRight: `3px solid ${color}` }}
                      onClick={(e) => { e.stopPropagation(); openEditForm(event); }}
                    >
                      <div className="font-medium text-gray-800 leading-tight" style={{ fontSize: '11px' }}>
                        {event.title}
                      </div>
                      {event.event_time && (
                        <div className="flex items-center gap-0.5 mt-0.5 text-gray-500" style={{ fontSize: '10px' }}>
                          <Clock size={9} />
                          <span>{event.event_time}</span>
                        </div>
                      )}
                      {event.notes && (
                        <div className="text-gray-400 mt-0.5 truncate" style={{ fontSize: '10px' }}>
                          {event.notes}
                        </div>
                      )}
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('למחוק פגישה זו?')) deleteWeeklyEvent(event.id);
                        }}
                        className="absolute top-0.5 left-0.5 opacity-0 group-hover/event:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Empty state - subtle plus */}
                  {dayEvents.length === 0 && isCurrentMonth && (
                    <div className="flex items-center justify-center h-[50px] opacity-0 hover:opacity-50 transition-opacity">
                      <Plus size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
