import { describe, it, expect } from 'vitest';
import { parseDiff } from './diff-parser';
import {
  SIMPLE_SINGLE_FILE_DIFF,
  MULTI_FILE_DIFF,
  DELETED_FILE_DIFF,
  ADDED_FILE_DIFF,
  RENAMED_FILE_DIFF,
  RENAMED_WITH_CHANGES_DIFF,
} from '../../tests/fixtures/diffs';
import { DiffParseError } from '@/shared/types';

describe('parseDiff', () => {
  describe('single file diffs', () => {
    it('should parse a simple single-file diff', () => {
      const result = parseDiff(SIMPLE_SINGLE_FILE_DIFF);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.path).toBe('src/app.ts');
      expect(result.files[0]?.language).toBe('typescript');
      expect(result.files[0]?.changeType).toBe('modified');
      expect(result.files[0]?.hunks).toHaveLength(1);
    });

    it('should parse hunks correctly', () => {
      const result = parseDiff(SIMPLE_SINGLE_FILE_DIFF);
      const hunk = result.files[0]?.hunks[0];

      expect(hunk).toBeDefined();
      expect(hunk?.oldStart).toBe(1);
      expect(hunk?.oldLines).toBe(3);
      expect(hunk?.newStart).toBe(1);
      expect(hunk?.newLines).toBe(4);
      expect(hunk?.lines).toHaveLength(4);
    });

    it('should parse diff lines with correct types', () => {
      const result = parseDiff(SIMPLE_SINGLE_FILE_DIFF);
      const lines = result.files[0]?.hunks[0]?.lines;

      expect(lines).toBeDefined();
      expect(lines?.[0]?.type).toBe('add');
      expect(lines?.[0]?.content).toContain('import { Logger }');
      expect(lines?.[0]?.newLineNumber).toBe(1);
      expect(lines?.[0]?.oldLineNumber).toBeUndefined();

      expect(lines?.[1]?.type).toBe('context');
      expect(lines?.[1]?.oldLineNumber).toBe(1);
      expect(lines?.[1]?.newLineNumber).toBe(2);
    });

    it('should calculate stats correctly for single file', () => {
      const result = parseDiff(SIMPLE_SINGLE_FILE_DIFF);

      expect(result.stats.filesChanged).toBe(1);
      expect(result.stats.insertions).toBe(1);
      expect(result.stats.deletions).toBe(0);
    });
  });

  describe('multi-file diffs', () => {
    it('should parse multiple files', () => {
      const result = parseDiff(MULTI_FILE_DIFF);

      expect(result.files).toHaveLength(2);
      expect(result.files[0]?.path).toBe('src/app.ts');
      expect(result.files[1]?.path).toBe('src/utils.ts');
    });

    it('should calculate stats correctly for multiple files', () => {
      const result = parseDiff(MULTI_FILE_DIFF);

      expect(result.stats.filesChanged).toBe(2);
      expect(result.stats.insertions).toBe(2); // 1 add in app.ts, 1 add in utils.ts
      expect(result.stats.deletions).toBe(1); // 1 delete in utils.ts
    });
  });

  describe('file change types', () => {
    it('should detect added files', () => {
      const result = parseDiff(ADDED_FILE_DIFF);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.changeType).toBe('added');
      expect(result.files[0]?.oldPath).toBeUndefined();
      expect(result.stats.insertions).toBe(3);
      expect(result.stats.deletions).toBe(0);
    });

    it('should detect deleted files', () => {
      const result = parseDiff(DELETED_FILE_DIFF);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.changeType).toBe('deleted');
      expect(result.stats.insertions).toBe(0);
      expect(result.stats.deletions).toBe(3);
    });

    it('should detect renamed files without changes', () => {
      const result = parseDiff(RENAMED_FILE_DIFF);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.changeType).toBe('renamed');
      expect(result.files[0]?.oldPath).toBe('old-name.ts');
      expect(result.files[0]?.path).toBe('new-name.ts');
      expect(result.files[0]?.hunks).toHaveLength(0);
    });

    it('should detect renamed files with changes', () => {
      const result = parseDiff(RENAMED_WITH_CHANGES_DIFF);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.changeType).toBe('renamed');
      expect(result.files[0]?.oldPath).toBe('old-name.ts');
      expect(result.files[0]?.path).toBe('new-name.ts');
      expect(result.files[0]?.hunks).toHaveLength(1);
      expect(result.stats.insertions).toBeGreaterThan(0);
    });
  });

  describe('language detection', () => {
    it('should detect TypeScript files', () => {
      const result = parseDiff(SIMPLE_SINGLE_FILE_DIFF);
      expect(result.files[0]?.language).toBe('typescript');
    });

    it('should detect various file types', () => {
      const testCases = [
        { path: 'test.tsx', expected: 'tsx' },
        { path: 'test.js', expected: 'javascript' },
        { path: 'test.jsx', expected: 'jsx' },
        { path: 'test.py', expected: 'python' },
        { path: 'test.go', expected: 'go' },
        { path: 'test.rs', expected: 'rust' },
        { path: 'test.java', expected: 'java' },
        { path: 'test.cpp', expected: 'cpp' },
        { path: 'test.md', expected: 'markdown' },
        { path: 'test.json', expected: 'json' },
        { path: 'test.unknown', expected: 'plaintext' },
      ];

      testCases.forEach(({ path, expected }) => {
        const diff = `diff --git a/${path} b/${path}\nindex 000..111 100644\n--- a/${path}\n+++ b/${path}\n@@ -1 +1 @@\n-old\n+new`;
        const result = parseDiff(diff);
        expect(result.files[0]?.language).toBe(expected);
      });
    });
  });

  describe('line numbering', () => {
    it('should assign correct line numbers for additions', () => {
      const diff = `diff --git a/test.ts b/test.ts
index 000..111 100644
--- a/test.ts
+++ b/test.ts
@@ -1,2 +1,3 @@
 line1
+line2
 line3`;

      const result = parseDiff(diff);
      const lines = result.files[0]?.hunks[0]?.lines;

      expect(lines?.[0]).toEqual({
        type: 'context',
        content: ' line1',
        oldLineNumber: 1,
        newLineNumber: 1,
      });
      expect(lines?.[1]).toEqual({
        type: 'add',
        content: '+line2',
        newLineNumber: 2,
        oldLineNumber: undefined,
      });
      expect(lines?.[2]).toEqual({
        type: 'context',
        content: ' line3',
        oldLineNumber: 2,
        newLineNumber: 3,
      });
    });

    it('should assign correct line numbers for deletions', () => {
      const diff = `diff --git a/test.ts b/test.ts
index 000..111 100644
--- a/test.ts
+++ b/test.ts
@@ -1,3 +1,2 @@
 line1
-line2
 line3`;

      const result = parseDiff(diff);
      const lines = result.files[0]?.hunks[0]?.lines;

      expect(lines?.[1]).toEqual({
        type: 'delete',
        content: '-line2',
        oldLineNumber: 2,
        newLineNumber: undefined,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty diff', () => {
      const result = parseDiff('');

      expect(result.files).toHaveLength(0);
      expect(result.stats).toEqual({
        filesChanged: 0,
        insertions: 0,
        deletions: 0,
      });
    });

    it('should handle diff with no changes (empty hunks)', () => {
      const diff = `diff --git a/test.ts b/test.ts
index 000..111 100644`;

      const result = parseDiff(diff);

      expect(result.files).toHaveLength(1);
      expect(result.files[0]?.hunks).toHaveLength(0);
    });

    it('should handle multiple hunks in one file', () => {
      const diff = `diff --git a/test.ts b/test.ts
index 000..111 100644
--- a/test.ts
+++ b/test.ts
@@ -1,2 +1,3 @@
 line1
+added1
 line2
@@ -10,2 +11,3 @@
 line10
+added2
 line11`;

      const result = parseDiff(diff);

      expect(result.files[0]?.hunks).toHaveLength(2);
      expect(result.files[0]?.hunks[0]?.oldStart).toBe(1);
      expect(result.files[0]?.hunks[1]?.oldStart).toBe(10);
    });

    it('should throw DiffParseError on invalid diff format', () => {
      const invalidDiff = 'this is not a valid diff';

      expect(() => parseDiff(invalidDiff)).toThrow(DiffParseError);
    });

    it('should throw DiffParseError on malformed hunk header', () => {
      const malformedDiff = `diff --git a/test.ts b/test.ts
index 000..111 100644
--- a/test.ts
+++ b/test.ts
@@ invalid hunk header @@
+line1`;

      expect(() => parseDiff(malformedDiff)).toThrow(DiffParseError);
    });
  });

  describe('hunk headers with context', () => {
    it('should extract function name from hunk header', () => {
      const diff = `diff --git a/test.ts b/test.ts
index 000..111 100644
--- a/test.ts
+++ b/test.ts
@@ -1,2 +1,3 @@ function myFunction()
 line1
+line2
 line3`;

      const result = parseDiff(diff);

      expect(result.files[0]?.hunks[0]?.header).toBe('function myFunction()');
    });
  });

  describe('binary files', () => {
    it('should detect binary files', () => {
      const diff = `diff --git a/image.png b/image.png
index 000..111 100644
Binary files a/image.png and b/image.png differ`;

      const result = parseDiff(diff);

      expect(result.files[0]?.isBinary).toBe(true);
      expect(result.files[0]?.hunks).toHaveLength(0);
    });
  });
});
