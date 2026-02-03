/**
 * Git diff service
 * Executes git commands and returns parsed diff data
 */

import { simpleGit, SimpleGit } from 'simple-git';
import { parseDiff } from './diff-parser';
import type { ParsedDiff } from '@/shared/types';
import { GitError } from '@/shared/types';

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
}

/**
 * Get the git diff for uncommitted changes
 * 
 * @param options - Options for diff retrieval
 * @returns Parsed diff data
 * @throws GitError if git command fails
 */
export async function getDiff(options: GetDiffOptions = {}): Promise<ParsedDiff> {
  const { cwd = process.cwd(), staged = false } = options;

  try {
    const git: SimpleGit = simpleGit(cwd);

    // Get diff based on options
    const diffArgs = staged ? ['--cached'] : ['HEAD'];
    const diffOutput = await git.diff(diffArgs);

    // Parse the diff output
    return parseDiff(diffOutput);
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
