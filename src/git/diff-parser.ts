/**
 * Git diff parser
 * Parses unified diff format into structured data
 */

import type {
  ParsedDiff,
  DiffFile,
  DiffHunk,
  DiffLine,
  DiffStats,
  FileChangeType,
} from '@/shared/types';
import { DiffParseError } from '@/shared/types';
import {
  GIT_DIFF_HEADER_REGEX,
  GIT_FILE_MODE_REGEX,
  GIT_RENAME_REGEX,
  GIT_HUNK_HEADER_REGEX,
  detectLanguage,
} from '@/shared/constants';

/**
 * Parse a git diff string into structured format
 */
export function parseDiff(diffString: string): ParsedDiff {
  if (!diffString || diffString.trim() === '') {
    return {
      files: [],
      stats: {
        filesChanged: 0,
        insertions: 0,
        deletions: 0,
      },
    };
  }

  // Validate that this looks like a valid diff
  if (!diffString.includes('diff --git')) {
    throw new DiffParseError('Invalid diff format: missing "diff --git" header');
  }

  const lines = diffString.split('\n');
  const files: DiffFile[] = [];
  let currentFile: Partial<DiffFile> | null = null;
  let currentHunk: Partial<DiffHunk> | null = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check for diff header (start of new file)
    const diffHeaderMatch = line.match(GIT_DIFF_HEADER_REGEX);
    if (diffHeaderMatch) {
      // Save previous file if exists
      if (currentFile && currentFile.path) {
        finishFile(currentFile, currentHunk, files);
        currentFile = null;
        currentHunk = null;
      }

      // Start new file
      const [, oldPath, newPath] = diffHeaderMatch;
      currentFile = {
        path: newPath || '',
        oldPath: oldPath !== newPath ? oldPath : undefined,
        language: detectLanguage(newPath || ''),
        changeType: 'modified',
        hunks: [],
        isBinary: false,
      };
      continue;
    }

    if (!currentFile) continue;

    // Check for file mode changes (new/deleted file)
    const fileModeMatch = line.match(GIT_FILE_MODE_REGEX);
    if (fileModeMatch) {
      const [, mode] = fileModeMatch;
      if (mode === 'new') {
        currentFile.changeType = 'added';
      } else if (mode === 'deleted') {
        currentFile.changeType = 'deleted';
      }
      continue;
    }

    // Check for rename
    const renameMatch = line.match(GIT_RENAME_REGEX);
    if (renameMatch) {
      const [, direction, path] = renameMatch;
      currentFile.changeType = 'renamed';
      if (direction === 'from') {
        currentFile.oldPath = path;
      } else if (direction === 'to') {
        currentFile.path = path;
        currentFile.language = detectLanguage(path || '');
      }
      continue;
    }

    // Check for binary file
    if (line.startsWith('Binary files')) {
      currentFile.isBinary = true;
      continue;
    }

    // Check for hunk header
    if (line.startsWith('@@')) {
      const hunkMatch = line.match(GIT_HUNK_HEADER_REGEX);
      if (!hunkMatch) {
        throw new DiffParseError('Malformed hunk header', line);
      }

      // Save previous hunk if exists
      if (currentHunk && currentHunk.lines) {
        currentFile.hunks?.push(currentHunk as DiffHunk);
      }

      // Parse hunk header
      const [, oldStart, oldCount, newStart, newCount, header] = hunkMatch;
      oldLineNumber = parseInt(oldStart || '0', 10);
      newLineNumber = parseInt(newStart || '0', 10);

      currentHunk = {
        oldStart: oldLineNumber,
        oldLines: parseInt(oldCount || '1', 10),
        newStart: newLineNumber,
        newLines: parseInt(newCount || '1', 10),
        lines: [],
        header: header?.trim() || undefined,
      };
      continue;
    }

    // Parse diff lines (context, addition, deletion)
    if (currentHunk && currentHunk.lines) {
      const firstChar = line[0];
      
      if (firstChar === '+' && !line.startsWith('+++')) {
        // Addition
        const diffLine: DiffLine = {
          type: 'add',
          content: line,
          newLineNumber: newLineNumber++,
          oldLineNumber: undefined,
        };
        currentHunk.lines.push(diffLine);
      } else if (firstChar === '-' && !line.startsWith('---')) {
        // Deletion
        const diffLine: DiffLine = {
          type: 'delete',
          content: line,
          oldLineNumber: oldLineNumber++,
          newLineNumber: undefined,
        };
        currentHunk.lines.push(diffLine);
      } else if (firstChar === ' ') {
        // Context line
        const diffLine: DiffLine = {
          type: 'context',
          content: line,
          oldLineNumber: oldLineNumber++,
          newLineNumber: newLineNumber++,
        };
        currentHunk.lines.push(diffLine);
      }
      // Skip other lines (---, +++, etc.)
    }
  }

  // Save last file and hunk
  if (currentFile && currentFile.path) {
    finishFile(currentFile, currentHunk, files);
  }

  // Calculate stats
  const stats = calculateStats(files);

  return {
    files,
    stats,
  };
}

/**
 * Finish processing a file and add it to the files array
 */
function finishFile(
  file: Partial<DiffFile>,
  hunk: Partial<DiffHunk> | null,
  files: DiffFile[]
): void {
  // Add last hunk if exists
  if (hunk && hunk.lines && file.hunks) {
    file.hunks.push(hunk as DiffHunk);
  }

  // Validate required fields
  if (!file.path) {
    throw new DiffParseError('File path is required');
  }

  files.push({
    path: file.path,
    oldPath: file.oldPath,
    language: file.language || 'plaintext',
    changeType: file.changeType || 'modified',
    hunks: file.hunks || [],
    isBinary: file.isBinary || false,
  });
}

/**
 * Calculate overall diff statistics
 */
function calculateStats(files: DiffFile[]): DiffStats {
  let insertions = 0;
  let deletions = 0;

  for (const file of files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'add') {
          insertions++;
        } else if (line.type === 'delete') {
          deletions++;
        }
      }
    }
  }

  return {
    filesChanged: files.length,
    insertions,
    deletions,
  };
}
