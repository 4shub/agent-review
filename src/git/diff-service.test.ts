import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDiff } from './diff-service';
import { mockGitDiff, mockGitError, mockGitNoDiff } from '../../tests/mocks/git';
import {
  SIMPLE_SINGLE_FILE_DIFF,
  MULTI_FILE_DIFF,
} from '../../tests/fixtures/diffs';
import { GitError } from '@/shared/types';

// Mock simple-git
vi.mock('simple-git', () => ({
  simpleGit: vi.fn(),
}));

describe('getDiff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful operations', () => {
    it('should fetch and parse uncommitted changes', async () => {
      const { simpleGit } = await import('simple-git');
      vi.mocked(simpleGit).mockReturnValue(
        mockGitDiff(SIMPLE_SINGLE_FILE_DIFF) as any
      );

      const result = await getDiff();

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.path).toBe('src/app.ts');
      expect(result.stats.filesChanged).toBe(1);
    });

    it('should call git diff with correct arguments', async () => {
      const { simpleGit } = await import('simple-git');
      const mockGit = mockGitDiff(SIMPLE_SINGLE_FILE_DIFF);
      vi.mocked(simpleGit).mockReturnValue(mockGit as any);

      await getDiff();

      expect(mockGit.diff).toHaveBeenCalledWith(['HEAD']);
    });

    it('should handle multiple files', async () => {
      const { simpleGit } = await import('simple-git');
      vi.mocked(simpleGit).mockReturnValue(
        mockGitDiff(MULTI_FILE_DIFF) as any
      );

      const result = await getDiff();

      expect(result.files).toHaveLength(2);
      expect(result.stats.filesChanged).toBe(2);
    });
  });

  describe('no changes scenarios', () => {
    it('should handle no changes gracefully', async () => {
      const { simpleGit } = await import('simple-git');
      vi.mocked(simpleGit).mockReturnValue(mockGitNoDiff() as any);

      const result = await getDiff();

      expect(result.files).toHaveLength(0);
      expect(result.stats.filesChanged).toBe(0);
      expect(result.stats.insertions).toBe(0);
      expect(result.stats.deletions).toBe(0);
    });

    it('should not throw error when diff is empty', async () => {
      const { simpleGit } = await import('simple-git');
      vi.mocked(simpleGit).mockReturnValue(mockGitNoDiff() as any);

      await expect(getDiff()).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw GitError when not a git repository', async () => {
      const { simpleGit } = await import('simple-git');
      vi.mocked(simpleGit).mockReturnValue(
        mockGitError('Not a git repository') as any
      );

      await expect(getDiff()).rejects.toThrow(GitError);
      await expect(getDiff()).rejects.toThrow('Not a git repository');
    });

    it('should throw GitError on other git errors', async () => {
      const { simpleGit } = await import('simple-git');
      vi.mocked(simpleGit).mockReturnValue(
        mockGitError('Permission denied') as any
      );

      await expect(getDiff()).rejects.toThrow(GitError);
    });

    it('should include original error as cause', async () => {
      const { simpleGit } = await import('simple-git');
      const originalError = new Error('Git failed');
      vi.mocked(simpleGit).mockReturnValue({
        diff: vi.fn().mockRejectedValue(originalError),
      } as any);

      try {
        await getDiff();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GitError);
        expect((error as GitError).cause).toBe(originalError);
      }
    });
  });

  describe('custom paths', () => {
    it('should accept custom working directory', async () => {
      const { simpleGit } = await import('simple-git');
      const mockGit = mockGitDiff(SIMPLE_SINGLE_FILE_DIFF);
      vi.mocked(simpleGit).mockReturnValue(mockGit as any);

      await getDiff({ cwd: '/custom/path' });

      expect(simpleGit).toHaveBeenCalledWith('/custom/path');
    });

    it('should use current directory by default', async () => {
      const { simpleGit } = await import('simple-git');
      const mockGit = mockGitDiff(SIMPLE_SINGLE_FILE_DIFF);
      vi.mocked(simpleGit).mockReturnValue(mockGit as any);

      await getDiff();

      expect(simpleGit).toHaveBeenCalledWith(process.cwd());
    });
  });

  describe('diff options', () => {
    it('should support staged changes only', async () => {
      const { simpleGit } = await import('simple-git');
      const mockGit = mockGitDiff(SIMPLE_SINGLE_FILE_DIFF);
      vi.mocked(simpleGit).mockReturnValue(mockGit as any);

      await getDiff({ staged: true });

      expect(mockGit.diff).toHaveBeenCalledWith(['--cached']);
    });

    it('should support unstaged changes only (default)', async () => {
      const { simpleGit } = await import('simple-git');
      const mockGit = mockGitDiff(SIMPLE_SINGLE_FILE_DIFF);
      vi.mocked(simpleGit).mockReturnValue(mockGit as any);

      await getDiff({ staged: false });

      expect(mockGit.diff).toHaveBeenCalledWith(['HEAD']);
    });
  });
});
