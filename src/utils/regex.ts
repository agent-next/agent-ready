/**
 * Regex utilities with safety checks
 *
 * Prevents ReDoS (Regular Expression Denial of Service) attacks
 * from malicious or poorly written regex patterns in profiles
 */

/**
 * Check if a regex pattern is potentially dangerous (catastrophic backtracking)
 *
 * This is a simple heuristic check for common ReDoS patterns:
 * - Nested quantifiers: (a+)+ or (a*)*
 * - Overlapping alternations with quantifiers: (a|a)+
 * - Repetition of overlapping groups
 */
export function isUnsafeRegex(pattern: string): boolean {
  // Check for nested quantifiers like (a+)+, (a*)+, (a+)*, (a*)*
  const nestedQuantifiers = /\([^)]*[+*][^)]*\)[+*]/;
  if (nestedQuantifiers.test(pattern)) {
    return true;
  }

  // Check for repeated groups with quantifiers
  const repeatedGroups = /\([^)]+\)\{[^}]*,[^}]*\}/;
  if (repeatedGroups.test(pattern)) {
    // Only flag if the group contains quantifiers
    const groupContent = pattern.match(/\(([^)]+)\)/)?.[1] || '';
    if (/[+*]/.test(groupContent)) {
      return true;
    }
  }

  // Check for overlapping character classes with quantifiers
  // e.g., [a-zA-Z]*[a-z]* on input like "aaaaaaaaaaaaaaaaaaaaaaaa!"
  const overlappingClasses = /\[[^\]]*\][+*]\[[^\]]*\][+*]/;
  if (overlappingClasses.test(pattern)) {
    return true;
  }

  return false;
}

/**
 * Safely create a regex, returning null if pattern is invalid or unsafe
 */
export function safeRegex(pattern: string, flags?: string): RegExp | null {
  if (isUnsafeRegex(pattern)) {
    return null;
  }

  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

/**
 * Test content against a regex pattern with timeout protection
 * Returns false if pattern is invalid/unsafe or times out
 */
export function safeRegexTest(
  pattern: string,
  content: string,
  flags?: string
): { matched: boolean; error?: string } {
  if (isUnsafeRegex(pattern)) {
    return { matched: false, error: 'Potentially unsafe regex pattern detected' };
  }

  try {
    const regex = new RegExp(pattern, flags);

    // For very long content, limit what we test
    const maxContentLength = 1_000_000; // 1MB
    const testContent =
      content.length > maxContentLength ? content.substring(0, maxContentLength) : content;

    return { matched: regex.test(testContent) };
  } catch (e) {
    return {
      matched: false,
      error: `Invalid regex pattern: ${e instanceof Error ? e.message : 'unknown error'}`,
    };
  }
}
