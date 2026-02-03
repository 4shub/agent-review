/**
 * Git diff service
 * Executes git commands and returns parsed diff data
 */

import { simpleGit, SimpleGit } from 'simple-git';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseDiff } from './diff-parser';
import type { ParsedDiff, DiffFile, DiffHunk, DiffLine } from '@/shared/types';
import { GitError } from '@/shared/types';
import { detectLanguage } from '@/shared/constants';

/**
 * Options for getDiff function
 */
export interface GetDiffOptions {
  /**
   * Working directory (defaults to current directory)
   */
  cwd?: string;

  /**
   * Get only staged changes (--cached)
   * If false (default), gets all uncommitted changes (HEAD)
   */
  staged?: boolean;

  /**
   * Include untracked files in the diff
   * Default: true
   */
  includeUntracked?: boolean;

  /**
   * Compare against a specific commit instead of HEAD
   * Useful for "since last review" functionality
   */
  sinceCommit?: string;
}

/**
 * Get the git diff for uncommitted changes
 * 
 * @param options - Options for diff retrieval
 * @returns Parsed diff data
 * @throws GitError if git command fails
 */
export async function getDiff(options: GetDiffOptions = {}): Promise<ParsedDiff> {
  const { cwd = process.cwd(), staged = false, includeUntracked = true, sinceCommit } = options;

  try {
    const git: SimpleGit = simpleGit(cwd);

    // Get diff based on options
    let diffArgs: string[];
    if (staged) {
      diffArgs = ['--cached'];
    } else if (sinceCommit) {
      diffArgs = [sinceCommit];
    } else {
      diffArgs = ['HEAD'];
    }
    
    const diffOutput = await git.diff(diffArgs);

    // Parse the diff output
    const parsedDiff = parseDiff(diffOutput);

    // If includeUntracked, add untracked files to the diff
    if (includeUntracked && !staged) {
      const untrackedFiles = await getUntrackedFiles(git, cwd);
      if (untrackedFiles.length > 0) {
        parsedDiff.files.push(...untrackedFiles);
        parsedDiff.stats.filesChanged += untrackedFiles.length;
        
        // Update insertions count
        for (const file of untrackedFiles) {
          for (const hunk of file.hunks) {
            for (const line of hunk.lines) {
              if (line.type === 'add') {
                parsedDiff.stats.insertions++;
              }
            }
          }
        }
      }
    }

    return parsedDiff;
  } catch (error) {
    // Wrap git errors in GitError for better error handling
    if (error instanceof Error) {
      throw new GitError(error.message, error);
    }
    throw new GitError('Unknown git error occurred');
  }
}

/**
 * Check if the current directory is a git repository
 * 
 * @param cwd - Working directory to check (defaults to current directory)
 * @returns True if directory is a git repository
 */
export async function isGitRepository(cwd: string = process.cwd()): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit(cwd);
    await git.revparse(['--git-dir']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current branch name
 * 
 * @param cwd - Working directory (defaults to current directory)
 * @returns Current branch name
 * @throws GitError if not in a git repository
 */
export async function getCurrentBranch(cwd: string = process.cwd()): Promise<string> {
  try {
    const git: SimpleGit = simpleGit(cwd);
    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new GitError(error.message, error);
    }
    throw new GitError('Failed to get current branch');
  }
}

/**
 * Get the current commit hash
 * 
 * @param cwd - Working directory (defaults to current directory)
 * @returns Current commit hash (short)
 * @throws GitError if not in a git repository or no commits
 */
export async function getCurrentCommitHash(cwd: string = process.cwd()): Promise<string> {
  try {
    const git: SimpleGit = simpleGit(cwd);
    const hash = await git.revparse(['--short', 'HEAD']);
    return hash.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new GitError(error.message, error);
    }
    throw new GitError('Failed to get current commit hash');
  }
}

/**
 * Get untracked files and convert them to DiffFile format
 * 
 * @param git - SimpleGit instance
 * @param cwd - Working directory
 * @returns Array of DiffFile objects for untracked files
 */
async function getUntrackedFiles(git: SimpleGit, cwd: string): Promise<DiffFile[]> {
  try {
    const status = await git.status();
    const untrackedFiles: DiffFile[] = [];

    for (const file of status.not_added) {
      try {
        // Read file content
        const filePath = join(cwd, file);
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Create diff lines (all additions)
        const diffLines: DiffLine[] = lines.map((line, index) => ({
          type: 'add' as const,
          content: `+${line}`,
          newLineNumber: index + 1,
          oldLineNumber: undefined,
        }));

        // Create single hunk with all content
        const hunk: DiffHunk = {
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: lines.length,
          lines: diffLines,
        };

        // Create DiffFile
        const diffFile: DiffFile = {
          path: file,
          language: detectLanguage(file),
          changeType: 'added',
          hunks: [hunk],
          isBinary: false,
        };

        untrackedFiles.push(diffFile);
      } catch (error) {
        // Skip files that can't be read (binary, permissions, etc.)
        console.warn(`Skipping untracked file ${file}: ${error}`);
      }
    }

    return untrackedFiles;
  } catch (error) {
    // If we can't get status, just return empty array (don't fail)
    return [];
  }
}
