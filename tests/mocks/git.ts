import { vi } from 'vitest';
import { SIMPLE_SINGLE_FILE_DIFF } from '../fixtures/diffs';

/**
 * Mock implementations for simple-git
 */

export const mockGitDiff = (returnValue: string = SIMPLE_SINGLE_FILE_DIFF) => {
  return {
    diff: vi.fn().mockResolvedValue(returnValue),
    status: vi.fn().mockResolvedValue({ 
      files: [],
      staged: [],
      modified: ['src/app.ts'],
    }),
    revparse: vi.fn().mockResolvedValue('main'),
  };
};

export const mockGitError = (errorMessage: string = 'Not a git repository') => {
  return {
    diff: vi.fn().mockRejectedValue(new Error(errorMessage)),
    status: vi.fn().mockRejectedValue(new Error(errorMessage)),
  };
};

export const mockGitNoDiff = () => {
  return {
    diff: vi.fn().mockResolvedValue(''),
    status: vi.fn().mockResolvedValue({ 
      files: [],
      staged: [],
      modified: [],
    }),
  };
};
