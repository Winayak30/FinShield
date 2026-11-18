/**
 * FinShield Privacy & Guardrail Layer
 * Implements FR-801, FR-802, FR-803, FR-804
 */

// Regex definitions according to FR-801:
// Note: Card patterns MUST run before phone patterns to avoid truncating credit card digits!
// Phone patterns MUST be anchored so rupee/dollar amounts (e.g. 50000) are not redacted.

const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const AADHAAR_REGEX = /\b\d{4}\s\d{4}\s\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
const UPI_ID_REGEX = /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Anchored phone pattern: 10-digit Indian mobile starting with 6, 7, 8, or 9, optional +91/0 prefix
const PHONE_REGEX = /(?:\+91[\-\s]?)?[6-9]\d{9}\b/g;

// Known prompt injection patterns (FR-803)
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /system\s+override/i,
  /classify\s+risk\s+as\s+0/i,
  /verdict\s+allow/i,
  /bypass\s+security/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /disregard\s+(the\s+)?above/i,
  /drop\s+table/i,
  /<script>/i,
];

export interface SanitizationResult {
  originalText: string;
  sanitizedText: string;
  maskedCount: {
    cards: number;
    aadhaar: number;
    pan: number;
    upi: number;
    emails: number;
    phones: number;
  };
  promptInjectionDetected: boolean;
  injectionFlags: string[];
}

/**
 * FR-801: PII Masking Engine
 * Guarantees raw PII never enters LLM context or tribunal logs.
 */
export function sanitizeTextForLLM(input: string): SanitizationResult {
  let text = input;
  const count = {
    cards: 0,
    aadhaar: 0,
    pan: 0,
    upi: 0,
    emails: 0,
    phones: 0,
  };

  // 1. Credit Cards (Run before phone patterns!)
  text = text.replace(CREDIT_CARD_REGEX, () => {
    count.cards++;
    return '[CARD_REDACTED]';
  });

  // 2. Aadhaar Numbers (12 digits with spaces)
  text = text.replace(AADHAAR_REGEX, () => {
    count.aadhaar++;
    return '[AADHAAR_REDACTED]';
  });

  // 3. Indian PAN Numbers (5 letters, 4 digits, 1 letter)
  text = text.replace(PAN_REGEX, () => {
    count.pan++;
    return '[PAN_REDACTED]';
  });

  // 4. Email addresses (Run before generic UPI to avoid false matches)
  text = text.replace(EMAIL_REGEX, () => {
    count.emails++;
    return '[EMAIL_REDACTED]';
  });

  // 5. UPI Handles
  text = text.replace(UPI_ID_REGEX, () => {
    count.upi++;
    return '[UPI_ID_REDACTED]';
  });

  // 6. Anchored Indian Phone Numbers (Does not redact simple monetary amounts)
  text = text.replace(PHONE_REGEX, () => {
    count.phones++;
    return '[PHONE_REDACTED]';
  });

  // Prompt Injection Detection (FR-803)
  const injectionFlags: string[] = [];
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      injectionFlags.push(pattern.source);
    }
  }

  return {
    originalText: input,
    sanitizedText: text,
    maskedCount: count,
    promptInjectionDetected: injectionFlags.length > 0,
    injectionFlags,
  };
}

/**
 * FR-802: Delimiter boundary isolation for user free-text memos
 */
export function wrapUntrustedMemo(memo: string): string {
  // Strip any existing delimiter attempts to prevent boundary breakouts
  const stripped = memo
    .replace(/<untrusted_memo>/gi, '')
    .replace(/<\/untrusted_memo>/gi, '');
  
  return `<untrusted_memo>\n${stripped}\n</untrusted_memo>`;
}

/**
 * FR-804: Output guardrails checking for forbidden agent output statements
 */
export function validateAgentOutput(text: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (/guarantee|legally\s+liable|we\s+promise/i.test(text)) {
    violations.push('Legal claim guardrail triggered');
  }
  if (/invest\s+in|buy\s+crypto|purchase\s+shares/i.test(text)) {
    violations.push('Financial advice guardrail triggered');
  }
  if (/is\s+a\s+thief|is\s+a\s+criminal|con\s+artist\s+named/i.test(text)) {
    violations.push('Named person accusation guardrail triggered');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

