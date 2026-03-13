// ── Suspicious input detection ─────────────────────────────────────────────────
// Blocks common XSS vectors (HTML tags, event handlers, javascript: protocol)
// and obvious SQL injection patterns without rejecting legitimate passwords.

const XSS_PATTERN = /<[^>]*?>|javascript\s*:|on\w+\s*=/i;

// Matches full SQL statement shapes (keyword + required clause) so that
// individual words like "select" or "update" in a password don't false-positive.
// Covered patterns:
//   SELECT … FROM   INSERT INTO   UPDATE … SET   DELETE FROM
//   DROP TABLE/DATABASE   ALTER TABLE   UNION SELECT
//   ' OR/AND '  or  ' OR/AND 1   inline comment (--)   ; followed by DML keyword
const SQL_PATTERN =
  /\bSELECT\s+[\w\s*,]+\bFROM\b|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b|\bDELETE\s+FROM\b|\bDROP\s+(?:TABLE|DATABASE)\b|\bALTER\s+TABLE\b|\bUNION\s+SELECT\b|'\s*(?:OR|AND)\s*['"\d]|;\s*(?:DROP|DELETE|INSERT|UPDATE|SELECT)\b|\s--(?:\s|$)/i;

export function isSuspicious(value: string): boolean {
  return XSS_PATTERN.test(value) || SQL_PATTERN.test(value);
}

// ── Field validators ───────────────────────────────────────────────────────────
// Each returns a translation key string on failure, or null on success.

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "emailRequired";
  if (isSuspicious(value)) return "suspicious";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "emailInvalid";
  return null;
}

/** Sign-in only — checks presence and suspicious content, not strength. */
export function validateSignInPassword(value: string): string | null {
  if (!value) return "passwordRequired";
  if (isSuspicious(value)) return "suspicious";
  return null;
}

/** Sign-up — full strength requirements. */
export function validateSignUpPassword(value: string): string | null {
  if (!value) return "passwordRequired";
  if (isSuspicious(value)) return "suspicious";
  if (value.length < 8) return "passwordMinLength";
  if (!/[A-Z]/.test(value)) return "passwordUppercase";
  if (!/[0-9]/.test(value)) return "passwordNumber";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return "confirmRequired";
  if (password !== confirm) return "passwordMismatch";
  return null;
}
