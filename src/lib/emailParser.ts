/**
 * Parses .eml (MIME) and .msg (Outlook) email files dragged from Outlook.
 * Extracts subject, sender, date, and body text to create tasks.
 */

export interface ParsedEmail {
  subject: string;
  from: string;
  date: string | null;
  body: string;
}

/**
 * Parse an .eml file (standard MIME format).
 */
function parseEml(text: string): ParsedEmail {
  const headers: Record<string, string> = {};
  const headerEnd = text.indexOf('\r\n\r\n') !== -1
    ? text.indexOf('\r\n\r\n')
    : text.indexOf('\n\n');

  const headerBlock = text.substring(0, headerEnd);
  const bodyBlock = text.substring(headerEnd).trim();

  // Unfold multi-line headers
  const unfolded = headerBlock.replace(/\r?\n[ \t]+/g, ' ');
  for (const line of unfolded.split(/\r?\n/)) {
    const match = line.match(/^([^:]+):\s*(.*)/);
    if (match) {
      headers[match[1].toLowerCase()] = match[2];
    }
  }

  const subject = decodeHeaderValue(headers['subject'] || '(ללא נושא)');
  const from = decodeHeaderValue(headers['from'] || '');
  const dateStr = headers['date'] || null;

  // Extract plain text body (simplified - handles plain text and basic multipart)
  let body = '';
  if (bodyBlock.includes('Content-Type: text/plain')) {
    const plainMatch = bodyBlock.match(
      /Content-Type: text\/plain[^\r\n]*\r?\n(?:Content-Transfer-Encoding:[^\r\n]*\r?\n)?(?:\r?\n)([\s\S]*?)(?:\r?\n--|\Z)/
    );
    body = plainMatch ? plainMatch[1] : '';
  } else {
    // Simple non-multipart text
    body = bodyBlock.replace(/^Content-Type:[^\n]*\n(?:Content-Transfer-Encoding:[^\n]*\n)?\n?/, '');
  }

  // Decode quoted-printable if needed
  if (body.includes('=\r\n') || body.includes('=\n') || body.match(/=[0-9A-F]{2}/i)) {
    body = decodeQuotedPrintable(body);
  }

  // Trim body to first ~500 chars for the task note
  body = body.trim().substring(0, 500);

  return { subject, from, date: dateStr, body };
}

/**
 * Decode RFC 2047 encoded header values (=?charset?encoding?text?=)
 */
function decodeHeaderValue(value: string): string {
  return value.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_match, _charset, encoding, text) => {
    if (encoding.toUpperCase() === 'B') {
      try { return atob(text); } catch { return text; }
    }
    if (encoding.toUpperCase() === 'Q') {
      return decodeQuotedPrintable(text.replace(/_/g, ' '));
    }
    return text;
  });
}

function decodeQuotedPrintable(text: string): string {
  return text
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Parse .msg files (binary Outlook format) - basic extraction.
 * For full support, a dedicated library would be needed.
 * This does a best-effort extraction from the binary content.
 */
function parseMsg(buffer: ArrayBuffer): ParsedEmail {
  // .msg files are OLE2 (Compound Binary) format.
  // We do a best-effort string extraction for subject/from/body.
  const decoder = new TextDecoder('utf-16le', { fatal: false });
  const text = decoder.decode(buffer);

  // Also try UTF-8 for some fields
  const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

  // Try to find subject - often appears as a readable string
  let subject = '(מייל מ-Outlook)';
  let from = '';
  let body = '';

  // Search for common patterns in the binary text
  const subjectPatterns = [
    // UTF-16 strings often have null bytes between chars
    ...extractReadableStrings(text, 10),
    ...extractReadableStrings(utf8Text, 10),
  ];

  // The first long readable string is often the subject
  if (subjectPatterns.length > 0) {
    subject = subjectPatterns[0].substring(0, 200);
  }

  // Try to find email-like patterns for sender
  const emailMatch = utf8Text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    from = emailMatch[0];
  }

  // Get body from longer strings
  if (subjectPatterns.length > 1) {
    body = subjectPatterns.slice(1, 3).join('\n').substring(0, 500);
  }

  return { subject, from, date: null, body };
}

function extractReadableStrings(text: string, minLength: number): string[] {
  const results: string[] = [];
  // Remove null chars (from UTF-16) and find readable sequences
  const cleaned = text.replace(/\0/g, '');
  const matches = cleaned.match(/[\u0020-\u007E\u0590-\u05FF\u0600-\u06FF\u00C0-\u024F]{10,}/g);
  if (matches) {
    for (const m of matches) {
      if (m.length >= minLength && !m.match(/^[.\-_=+\/\\]+$/)) {
        results.push(m.trim());
      }
    }
  }
  return results;
}

/**
 * Main entry point: parse a dropped file and return email data.
 */
export async function parseEmailFile(file: File): Promise<ParsedEmail> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.eml')) {
    const text = await file.text();
    return parseEml(text);
  }

  if (name.endsWith('.msg')) {
    const buffer = await file.arrayBuffer();
    return parseMsg(buffer);
  }

  // For unknown files, try to read as text (e.g., dragged text from Outlook)
  try {
    const text = await file.text();
    // Check if it looks like MIME/email
    if (text.includes('From:') || text.includes('Subject:') || text.includes('MIME-Version')) {
      return parseEml(text);
    }
    // Otherwise treat the whole content as a note
    return {
      subject: file.name.replace(/\.[^.]+$/, ''),
      from: '',
      date: null,
      body: text.substring(0, 500),
    };
  } catch {
    return {
      subject: file.name,
      from: '',
      date: null,
      body: '',
    };
  }
}
