export interface ExtractedTask {
  title: string;
  assignee: string;
  due_date: string | null;
  notes: string;
}

const PROMPT = `You are analyzing a Hebrew document (likely a municipal comment letter or regulatory document related to urban planning/construction).
Extract actionable tasks from this document. Each task should represent a specific action item that needs to be done.

Return a JSON array of objects with these fields:
- title: A concise Hebrew task title (the action required)
- assignee: Who should handle this (if mentioned), empty string if unclear
- due_date: ISO date string if a deadline is mentioned, null otherwise
- notes: Brief context or the original clause reference in Hebrew

Return ONLY the JSON array, no markdown, no explanation.`;

export async function extractTasksFromText(text: string): Promise<ExtractedTask[]> {
  const response = await fetch('/api/extract-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, prompt: PROMPT }),
  });

  if (!response.ok) {
    throw new Error('שגיאה בחילוץ משימות מהמסמך');
  }

  const data = await response.json();

  // Extract text content from Claude's response
  const content = data.content?.[0]?.text ?? data.text ?? '';

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  const tasks: ExtractedTask[] = JSON.parse(cleaned);
  return tasks;
}
