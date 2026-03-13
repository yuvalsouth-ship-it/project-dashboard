/**
 * Parses uploaded documents (TXT, CSV, PDF) and extracts task-like items.
 * Uses heuristics to identify action items, bullet points, and numbered lists.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export interface ExtractedTask {
  title: string;
  assignee: string;
  dueDate: string | null;
  notes: string;
  selected: boolean;
}

/**
 * Parse a file and extract potential tasks from it.
 */
export async function parseDocumentFile(file: File): Promise<ExtractedTask[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    return parsePdf(file);
  }

  const text = await file.text();

  if (name.endsWith('.csv')) {
    return parseCsv(text);
  }

  // For .txt and other text files
  return parseTextDocument(text);
}

/**
 * Extract text from a PDF file and parse it for tasks.
 */
async function parsePdf(file: File): Promise<ExtractedTask[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return parseTextDocument(fullText);
}

/**
 * Parse CSV file - expects columns like: title, assignee, due_date, notes
 * Flexible: auto-detects column mapping from header row.
 */
function parseCsv(text: string): ExtractedTask[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = text.includes('\t') ? '\t' : ',';
  const headers = parseCsvLine(lines[0], delimiter).map((h) => h.trim().toLowerCase());

  // Map Hebrew/English column names
  const titleCol = findColumnIndex(headers, ['כותרת', 'title', 'משימה', 'task', 'נושא', 'subject', 'שם', 'name', 'פעילות', 'activity']);
  const assigneeCol = findColumnIndex(headers, ['אחראי', 'assignee', 'responsible', 'מבצע', 'owner']);
  const dueDateCol = findColumnIndex(headers, ['תאריך', 'date', 'due_date', 'due', 'תאריך יעד', 'deadline', 'מועד']);
  const notesCol = findColumnIndex(headers, ['הערות', 'notes', 'הערה', 'description', 'תיאור', 'פירוט']);

  const tasks: ExtractedTask[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    const title = titleCol >= 0 ? cols[titleCol]?.trim() : cols[0]?.trim();

    if (!title) continue;

    tasks.push({
      title,
      assignee: assigneeCol >= 0 ? (cols[assigneeCol]?.trim() || '') : '',
      dueDate: dueDateCol >= 0 ? parseDateString(cols[dueDateCol]?.trim()) : null,
      notes: notesCol >= 0 ? (cols[notesCol]?.trim() || '') : '',
      selected: true,
    });
  }

  return tasks;
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex((h) => h.includes(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

/**
 * Parse text document - extract lines that look like tasks.
 * Identifies: bullet points, numbered lists, lines with action keywords.
 */
function parseTextDocument(text: string): ExtractedTask[] {
  const lines = text.split(/\r?\n/);
  const tasks: ExtractedTask[] = [];

  // Patterns that indicate a task line
  const bulletPattern = /^[\s]*[-•●◦▪▸►*]\s+(.+)/;
  const numberedPattern = /^[\s]*\d+[.)]\s+(.+)/;
  const checkboxPattern = /^[\s]*[\[（(]\s?[xXvV✓✔ ]?\s?[\]）)]\s+(.+)/;
  const hebrewActionPattern = /^[\s]*(לבצע|לעשות|לטפל|לבדוק|לתאם|להכין|לשלוח|ליצור|לעדכן|להגיש|לסיים|לארגן|לוודא|לסכם|להעביר|לקבוע|לפנות|להזמין)\s+(.+)/;

  // Date pattern for extracting due dates from text
  const dateInLinePattern = /(?:עד|until|by|deadline)\s*[:：]?\s*(\d{1,2}[./\-]\d{1,2}(?:[./\-]\d{2,4})?)/i;
  // Assignee pattern
  const assigneeInLinePattern = /(?:אחראי|responsible)\s*[:：]?\s*([^\s,.-]+(?:\s+[^\s,.-]+)?)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;

    let taskTitle = '';

    // Check patterns in priority order
    const checkboxMatch = trimmed.match(checkboxPattern);
    if (checkboxMatch) {
      taskTitle = checkboxMatch[1].trim();
    } else {
      const bulletMatch = trimmed.match(bulletPattern);
      if (bulletMatch) {
        taskTitle = bulletMatch[1].trim();
      } else {
        const numberedMatch = trimmed.match(numberedPattern);
        if (numberedMatch) {
          taskTitle = numberedMatch[1].trim();
        } else {
          const actionMatch = trimmed.match(hebrewActionPattern);
          if (actionMatch) {
            taskTitle = trimmed;
          }
        }
      }
    }

    if (!taskTitle) continue;

    // Try extracting date and assignee from the task line
    let dueDate: string | null = null;
    let assignee = '';

    const dateMatch = taskTitle.match(dateInLinePattern);
    if (dateMatch) {
      dueDate = parseDateString(dateMatch[1]);
      taskTitle = taskTitle.replace(dateInLinePattern, '').trim();
    }

    const assigneeMatch = taskTitle.match(assigneeInLinePattern);
    if (assigneeMatch) {
      assignee = assigneeMatch[1].trim();
      taskTitle = taskTitle.replace(assigneeInLinePattern, '').trim();
    }

    // Clean trailing punctuation
    taskTitle = taskTitle.replace(/[,;:]+$/, '').trim();

    if (taskTitle.length >= 2) {
      tasks.push({
        title: taskTitle,
        assignee,
        dueDate,
        notes: '',
        selected: true,
      });
    }
  }

  return tasks;
}

/**
 * Try to parse a date string in various formats to YYYY-MM-DD.
 */
function parseDateString(str: string | undefined): string | null {
  if (!str) return null;
  str = str.trim();

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    let year = dmyMatch[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // YYYY-MM-DD (already in target format)
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  // DD/MM (no year - assume current year)
  const dmMatch = str.match(/^(\d{1,2})[./\-](\d{1,2})$/);
  if (dmMatch) {
    const year = new Date().getFullYear();
    const day = dmMatch[1].padStart(2, '0');
    const month = dmMatch[2].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}
