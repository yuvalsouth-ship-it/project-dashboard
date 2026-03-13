import { useState, useCallback, useRef } from 'react';
import { FileText, Upload, Check, X, Loader2, FileUp } from 'lucide-react';
import { parseDocumentFile, type ExtractedTask } from '../../../lib/documentParser';
import { useStore } from '../../../store/useStore';

interface Props {
  projectId: string;
}

export default function DocumentDropZone({ projectId }: Props) {
  const addTask = useStore((s) => s.addTask);
  const tasks = useStore((s) => s.tasks);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'preview' | 'done' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus('parsing');
    setErrorMsg('');

    try {
      const extracted = await parseDocumentFile(file);
      if (extracted.length === 0) {
        setErrorMsg('לא זוהו משימות במסמך. נסה מסמך עם רשימת נקודות, רשימה ממוספרת או פעלים כמו "לבצע", "לבדוק" וכו\'.');
        setStatus('error');
        return;
      }
      setExtractedTasks(extracted);
      setStatus('preview');
    } catch {
      setErrorMsg('שגיאה בקריאת הקובץ. ודא שהקובץ תקין.');
      setStatus('error');
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    processFile(files[0]);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
    e.target.value = '';
  }, [processFile]);

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

  const toggleTask = (index: number) => {
    setExtractedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateTaskField = (index: number, field: keyof ExtractedTask, value: string) => {
    setExtractedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const selectAll = () => {
    const allSelected = extractedTasks.every((t) => t.selected);
    setExtractedTasks((prev) => prev.map((t) => ({ ...t, selected: !allSelected })));
  };

  const createTasks = () => {
    const selected = extractedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    const currentCount = tasks.filter((t) => t.project_id === projectId).length;

    selected.forEach((task, i) => {
      addTask({
        project_id: projectId,
        title: task.title,
        status: 'todo',
        assignee: task.assignee,
        due_date: task.dueDate || null,
        notes: task.notes,
        order_index: currentCount + i,
      });
    });

    setStatus('done');
    setTimeout(() => {
      setStatus('idle');
      setExtractedTasks([]);
      setFileName('');
    }, 2500);
  };

  const cancel = () => {
    setStatus('idle');
    setExtractedTasks([]);
    setFileName('');
    setErrorMsg('');
  };

  if (status === 'done') {
    const count = extractedTasks.filter((t) => t.selected).length;
    return (
      <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700">
        <Check size={20} />
        <span className="text-sm font-medium">נוצרו {count} משימות בהצלחה!</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="border-2 border-red-200 bg-red-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <X size={18} />
            <span className="text-sm">{errorMsg}</span>
          </div>
          <button onClick={cancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (status === 'preview' && extractedTasks.length > 0) {
    const selectedCount = extractedTasks.filter((t) => t.selected).length;

    return (
      <div className="border-2 border-purple-300 bg-purple-50/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-purple-700">
            <FileText size={18} />
            <span className="text-sm font-medium">
              זוהו {extractedTasks.length} משימות מ-{fileName}
            </span>
          </div>
          <button onClick={cancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-purple-600 hover:text-purple-800 underline"
          >
            {extractedTasks.every((t) => t.selected) ? 'בטל בחירת הכל' : 'בחר הכל'}
          </button>
          <span className="text-xs text-gray-500">
            ({selectedCount} נבחרו)
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 mb-3">
          {extractedTasks.map((task, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2 rounded-lg border transition-colors ${
                task.selected
                  ? 'bg-white border-purple-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={task.selected}
                onChange={() => toggleTask(i)}
                className="mt-1 accent-purple-600"
              />
              <div className="flex-1 min-w-0">
                <input
                  value={task.title}
                  onChange={(e) => updateTaskField(i, 'title', e.target.value)}
                  className="w-full text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-gray-800 font-medium"
                />
                <div className="flex gap-2 mt-1">
                  <input
                    value={task.assignee}
                    onChange={(e) => updateTaskField(i, 'assignee', e.target.value)}
                    placeholder="אחראי..."
                    className="text-xs bg-transparent border-0 p-0 focus:outline-none text-gray-500 w-24"
                  />
                  <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => updateTaskField(i, 'dueDate', e.target.value)}
                    className="text-xs bg-transparent border-0 p-0 focus:outline-none text-gray-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={cancel}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={createTasks}
            disabled={selectedCount === 0}
            className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            צור {selectedCount} משימות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex items-center justify-center gap-3 ${
        isDragOver
          ? 'border-purple-400 bg-purple-50 scale-[1.01]'
          : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      {status === 'parsing' ? (
        <Loader2 size={20} className="text-purple-500 animate-spin" />
      ) : (
        <>
          <div className={`p-2 rounded-lg ${isDragOver ? 'bg-purple-100' : 'bg-gray-100'}`}>
            {isDragOver ? (
              <Upload size={18} className="text-purple-600" />
            ) : (
              <FileUp size={18} className="text-gray-500" />
            )}
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${isDragOver ? 'text-purple-700' : 'text-gray-600'}`}>
              {isDragOver ? 'שחרר כאן לניתוח משימות' : 'העלה מסמך לזיהוי משימות אוטומטי'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, TXT, CSV</p>
          </div>
        </>
      )}
    </div>
  );
}
