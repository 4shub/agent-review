/**
 * Shared constants used throughout the application
 */

import type { LanguageExtensionMap, SupportedLanguage } from './types';

// ============================================================================
// Server Configuration
// ============================================================================

export const DEFAULT_PORT = 3000;
export const DEFAULT_HOST = 'localhost';

// ============================================================================
// File and Directory Paths
// ============================================================================

export const REVIEW_STORAGE_DIR = '.code-review';
export const REVIEWS_SUBDIR = 'reviews';

// ============================================================================
// Language Detection
// ============================================================================

/**
 * Map file extensions to programming languages
 */
export const EXTENSION_TO_LANGUAGE: LanguageExtensionMap = {
  typescript: ['.ts', '.mts', '.cts'],
  tsx: ['.tsx'],
  javascript: ['.js', '.mjs', '.cjs'],
  jsx: ['.jsx'],
  python: ['.py', '.pyw'],
  go: ['.go'],
  rust: ['.rs'],
  java: ['.java'],
  c: ['.c', '.h'],
  cpp: ['.cpp', '.hpp', '.cc', '.cxx', '.c++', '.h++'],
  csharp: ['.cs'],
  php: ['.php'],
  ruby: ['.rb'],
  swift: ['.swift'],
  kotlin: ['.kt', '.kts'],
  html: ['.html', '.htm'],
  css: ['.css', '.scss', '.sass', '.less'],
  json: ['.json', '.jsonc'],
  yaml: ['.yaml', '.yml'],
  markdown: ['.md', '.mdx'],
};

/**
 * Detect language from file extension
 */
export function detectLanguage(filename: string): SupportedLanguage {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  for (const [language, extensions] of Object.entries(EXTENSION_TO_LANGUAGE)) {
    if (extensions.includes(ext)) {
      return language as SupportedLanguage;
    }
  }
  
  return 'plaintext';
}

// ============================================================================
// UI Constants
// ============================================================================

export const COMMENT_STORAGE_KEY_PREFIX = 'comment:';

/**
 * Generate storage key for a comment
 */
export function getCommentKey(file: string, line: number): string {
  return `${COMMENT_STORAGE_KEY_PREFIX}${file}:${line}`;
}

// ============================================================================
// Git Constants
// ============================================================================

export const GIT_DIFF_HEADER_REGEX = /^diff --git a\/(.*) b\/(.*)$/;
export const GIT_FILE_MODE_REGEX = /^(new|deleted) file mode \d+$/;
export const GIT_RENAME_REGEX = /^rename (from|to) (.*)$/;
export const GIT_SIMILARITY_REGEX = /^similarity index (\d+)%$/;
export const GIT_HUNK_HEADER_REGEX = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)$/;

// ============================================================================
// Validation Constants
// ============================================================================

export const MAX_COMMENT_LENGTH = 5000;
export const MAX_GENERAL_FEEDBACK_LENGTH = 10000;

// ============================================================================
// Performance Constants
// ============================================================================

export const DEBOUNCE_DELAY_MS = 300;
export const SERVER_SHUTDOWN_TIMEOUT_MS = 5000;
