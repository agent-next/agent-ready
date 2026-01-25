/**
 * Internationalization (i18n) module
 *
 * Provides translation functions for multi-language support.
 */

import type { Locale, Translations } from './types.js';
import en from './locales/en.js';
import zh from './locales/zh.js';

// Available translations
const translations: Record<Locale, Translations> = {
  en,
  zh,
};

// Current locale
let currentLocale: Locale = 'en';

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
  if (translations[locale]) {
    currentLocale = locale;
  } else {
    console.warn(`Unknown locale: ${locale}, falling back to 'en'`);
    currentLocale = 'en';
  }
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locale in translations;
}

/**
 * Get nested translation value by dot-notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Translate a key with optional parameter interpolation
 *
 * @param key - Dot-notation key (e.g., 'cli.scanning' or 'pillars.docs')
 * @param params - Optional parameters for interpolation
 * @returns Translated string with parameters replaced
 *
 * @example
 * t('cli.scanning', { path: '/home/project' })
 * // Returns: 'Scanning: /home/project'
 *
 * t('pillars.docs')
 * // Returns: 'Documentation'
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const translation = getNestedValue(
    translations[currentLocale] as unknown as Record<string, unknown>,
    key
  );

  if (translation === undefined) {
    // Fallback to English if key not found in current locale
    const fallback = getNestedValue(translations.en as unknown as Record<string, unknown>, key);
    if (fallback === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return interpolate(fallback, params);
  }

  return interpolate(translation, params);
}

/**
 * Interpolate parameters into a string
 * Replaces {key} with corresponding value from params
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) {
    return str;
  }

  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Get pillar name in current locale
 */
export function getPillarName(pillar: string): string {
  return t(`pillars.${pillar}`);
}

/**
 * Get level name in current locale
 */
export function getLevelName(level: string | null): string {
  return t(`levels.${level || 'none'}`);
}

/**
 * Get priority name in current locale
 */
export function getPriorityName(priority: string): string {
  return t(`priorities.${priority}`);
}

// Re-export types
export type { Locale, Translations } from './types.js';
export { LOCALES } from './types.js';
