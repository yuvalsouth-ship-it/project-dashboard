import { useState, useCallback } from 'react';
import { Mail, Upload, Check, X, Loader2 } from 'lucide-react';
import { parseEmailFile, type ParsedEmail } from '../../../lib/emailParser';
import { useStore } from '../../../store/useStore';

interface Props {
  projectId: string;
}

export default function EmailDropZone({ projectId }: Props) {
  const addTask = useStore((s) => s.addTask);
  const tasks = useStore((s) => s.tasks);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsed, setParsed] = useState<ParsedEmail | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'preview' | 'done'>('idle');
  const [editSubject, setEditSubject] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      // Maybe text was dragged
      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        setParsed({ subject: 'משימה מגרירה', from: '', date: null, body: text.substring(0, 500) });
        setEditSubject('משימה מגרירה');
        setStatus('preview');
        return;
      }
      return;
    }

    setStatus('parsing');
    const file = files[0];
    try {
      const email = await parseEmailFile(file);
      setParsed(email);
      setEditSubject(email.subject);
      setStatus('preview');
    } catch {
      setParsed({ subject: file.name, from: '', date: null, body: 'שגיאה בקריאת הקובץ' });
      setEditSubject(file.name);
      setStatus('preview');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const createTask = () => {
    if (!editSubject.trim()) return;

    const notes = [
      parsed?.from ? `מאת: ${parsed.from}` : '',
      parsed?.date ? `תאריך: ${parsed.date}` : '',
      parsed?.body || '',
    ].filter(Boolean).join('\n');

    addTask({
      project_id: projectId,
      title: editSubject.trim(),
      status: 'todo',
      assignee: editAssignee.trim(),
      due_date: editDueDate || null,
      notes: notes.substring(0, 1000),
      order_index: tasks.filter((t) => t.project_id === projectId).length,
    });

    setStatus('done');
    setTimeout(() => {
      setStatus('idle');
      setParsed(null);
      setEditSubject('');
      setEditAssignee('');
      setEditDueDate('');
    }, 2000);
  };

  const cancel = () => {
    setStatus('idle');
    setParsed(null);
    setEditSubject('');
    setEditAssignee('');
    setEditDueDate('');
  };

  if (status === 'done') {
    return (
      <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700">
        <Check size={20} />
        <span className="text-sm font-medium">המשימה נוצרה בהצלחה!</span>
      </div>
    );
  }

  if (status === 'preview' && parsed) {
    return (
      <div className="border-2 border-blue-300 bg-blue-50/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Mail size={18} />
            <span className="text-sm font-medium">יצירת משימה ממייל</span>
          </div>
          <button onClick={cancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">כותרת המשימה</label>
            <input
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">אחראי</label>
              <input
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                placeholder="הקצה אחראי..."
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">תאריך יעד</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(parsed.from || parsed.body) && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              {parsed.from && (
                <p className="text-xs text-gray-500 mb-1">
                  <span className="font-medium">מאת:</span> {parsed.from}
                </p>
              )}
              {parsed.date && (
                <p className="text-xs text-gray-500 mb-1">
                  <span className="font-medium">תאריך:</span> {parsed.date}
                </p>
              )}
              {parsed.body && (
                <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap line-clamp-4">
                  {parsed.body}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancel}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={createTask}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              צור משימה
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex items-center justify-center gap-3 ${
        isDragOver
          ? 'border-blue-400 bg-blue-50 scale-[1.01]'
          : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      {status === 'parsing' ? (
        <Loader2 size={20} className="text-blue-500 animate-spin" />
      ) : (
        <>
          <div className={`p-2 rounded-lg ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {isDragOver ? <Upload size={18} className="text-blue-600" /> : <Mail size={18} className="text-gray-500" />}
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${isDragOver ? 'text-blue-700' : 'text-gray-600'}`}>
              {isDragOver ? 'שחרר כאן ליצירת משימה' : 'גרור מייל מ-Outlook לכאן'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">קבצי .eml או .msg</p>
          </div>
        </>
      )}
    </div>
  );
}
