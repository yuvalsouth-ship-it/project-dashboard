import { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { extractTextFromPdf } from '../../../lib/pdfExtract';
import { extractTasksFromText, type ExtractedTask } from '../../../lib/aiExtractTasks';

interface Props {
  onTasksExtracted: (tasks: ExtractedTask[]) => void;
}

export default function PdfUploadButton({ onTasksExtracted }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-uploaded
    e.target.value = '';

    setIsProcessing(true);
    setError(null);

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setError('לא נמצא טקסט במסמך');
        return;
      }
      const tasks = await extractTasksFromText(text);
      if (tasks.length === 0) {
        setError('לא נמצאו משימות במסמך');
        return;
      }
      onTasksExtracted(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד המסמך');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>מעבד...</span>
          </>
        ) : (
          <>
            <FileUp size={16} />
            <span>ייבוא מ-PDF</span>
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-full mt-1 right-0 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-lg border border-red-200 whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
