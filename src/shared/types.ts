/**
 * Shared TypeScript type definitions
 * Used across the entire application for type safety
 */

// ============================================================================
// Git Diff Types
// ============================================================================

/**
 * Type of change for a single line in a diff
 */
export type DiffLineType = 'add' | 'delete' | 'context';

/**
 * A single line in a diff hunk
 */
export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;  // Line number in old file (undefined for additions)
  newLineNumber?: number;  // Line number in new file (undefined for deletions)
}

/**
 * A hunk represents a contiguous block of changes in a file
 */
export interface DiffHunk {
  oldStart: number;    // Starting line in old file
  oldLines: number;    // Number of lines in old file
  newStart: number;    // Starting line in new file
  newLines: number;    // Number of lines in new file
  lines: DiffLine[];   // All lines in this hunk
  header?: string;     // Optional hunk header (e.g., function name)
}

/**
 * Type of file change
 */
export type FileChangeType = 'added' | 'modified' | 'deleted' | 'renamed';

/**
 * A file with its diff information
 */
export interface DiffFile {
  path: string;              // Current file path
  oldPath?: string;          // Previous path (for renames)
  language: string;          // Programming language (detected from extension)
  changeType: FileChangeType;
  hunks: DiffHunk[];
  isBinary?: boolean;        // True if file is binary
}

/**
 * Statistics about the overall diff
 */
export interface DiffStats {
  filesChanged: number;
  insertions: number;
  deletions: number;
}

/**
 * Complete parsed diff with all files and stats
 */
export interface ParsedDiff {
  files: DiffFile[];
  stats: DiffStats;
}

// ============================================================================
// Review Feedback Types
// ============================================================================

/**
 * A comment on a specific line of code
 */
export interface LineComment {
  file: string;        // File path
  line: number;        // Line number in new file
  oldLine?: number;    // Line number in old file (for context)
  comment: string;     // The actual comment text
  context: string;     // The line of code being commented on
}

/**
 * Complete review feedback from a user
 */
export interface ReviewFeedback {
  timestamp: string;
  lineComments: LineComment[];
  generalFeedback: string;
  stats: {
    filesReviewed: number;
    commentsAdded: number;
  };
}

/**
 * Review submission payload
 */
export interface ReviewSubmission {
  feedback: ReviewFeedback;
  commit?: {
    message: string;
  };
}

/**
 * Stored review with additional metadata
 */
export interface StoredReview {
  id: string;
  timestamp: string;
  diff: ParsedDiff;        // Snapshot of diff for historical reference
  feedback: ReviewFeedback;
}

// ============================================================================
// Server Types
// ============================================================================

/**
 * Options for starting the review server
 */
export interface ServerOptions {
  port: number;
  open: boolean;  // Whether to auto-open browser
}

/**
 * Result from starting the server
 */
export interface ServerResult {
  url: string;
  submission: Promise<ReviewSubmission>;
  shutdown: () => Promise<void>;
}

// ============================================================================
// Frontend State Types
// ============================================================================

/**
 * Application state for the review UI
 */
export interface ReviewState {
  diff: ParsedDiff | null;
  comments: Map<string, LineComment[]>;  // Key: "filepath:lineNumber"
  selectedFile: string | null;
  generalFeedback: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Props for comment thread component
 */
export interface CommentThreadProps {
  file: string;
  line: number;
  oldLine?: number;
  context: string;
  existingComment?: LineComment;
  onSave: (comment: LineComment) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

/**
 * Props for file tree item
 */
export interface FileTreeItemProps {
  file: DiffFile;
  isSelected: boolean;
  onClick: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Language to file extension mapping
 */
export type LanguageExtensionMap = Record<string, string[]>;

/**
 * Supported programming languages for syntax highlighting
 */
export type SupportedLanguage = 
  | 'typescript'
  | 'javascript'
  | 'tsx'
  | 'jsx'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'html'
  | 'css'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'plaintext';

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error for git operations
 */
export class GitError extends Error {
  constructor(message: string, public override readonly cause?: Error) {
    super(message);
    this.name = 'GitError';
  }
}

/**
 * Custom error for diff parsing
 */
export class DiffParseError extends Error {
  constructor(message: string, public readonly line?: string) {
    super(message);
    this.name = 'DiffParseError';
  }
}

/**
 * Custom error for server operations
 */
export class ServerError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public override readonly cause?: Error
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid DiffLineType
 */
export function isDiffLineType(value: unknown): value is DiffLineType {
  return value === 'add' || value === 'delete' || value === 'context';
}

/**
 * Check if a value is a valid FileChangeType
 */
export function isFileChangeType(value: unknown): value is FileChangeType {
  return (
    value === 'added' ||
    value === 'modified' ||
    value === 'deleted' ||
    value === 'renamed'
  );
}

/**
 * Check if an object is a valid ParsedDiff
 */
export function isParsedDiff(value: unknown): value is ParsedDiff {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj['files']) &&
    typeof obj['stats'] === 'object' &&
    obj['stats'] !== null
  );
}

/**
 * Check if an object is a valid ReviewFeedback
 */
export function isReviewFeedback(value: unknown): value is ReviewFeedback {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['timestamp'] === 'string' &&
    Array.isArray(obj['lineComments']) &&
    typeof obj['generalFeedback'] === 'string' &&
    typeof obj['stats'] === 'object'
  );
}
