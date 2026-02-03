/**
 * Test fixtures for git diffs
 * These are realistic examples of git diff output for testing the parser
 */

export const SIMPLE_SINGLE_FILE_DIFF = `diff --git a/src/app.ts b/src/app.ts
index 1234567..abcdefg 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,3 +1,4 @@
+import { Logger } from './logger';
 function main() {
   console.log('Hello');
 }`;

export const MULTI_FILE_DIFF = `diff --git a/src/app.ts b/src/app.ts
index 1234567..abcdefg 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,2 +1,3 @@
+import { config } from './config';
 function main() {
   console.log('Hello');
diff --git a/src/utils.ts b/src/utils.ts
index aaa1111..bbb2222 100644
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,2 +1,2 @@
 export function helper() {
-  return 'old';
+  return 'new';
 }`;

export const DELETED_FILE_DIFF = `diff --git a/old-file.ts b/old-file.ts
deleted file mode 100644
index 1234567..0000000
--- a/old-file.ts
+++ /dev/null
@@ -1,3 +0,0 @@
-export function deprecated() {
-  return 'removed';
-}`;

export const ADDED_FILE_DIFF = `diff --git a/new-file.ts b/new-file.ts
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/new-file.ts
@@ -0,0 +1,3 @@
+export function newFunction() {
+  return 'added';
+}`;

export const RENAMED_FILE_DIFF = `diff --git a/old-name.ts b/new-name.ts
similarity index 100%
rename from old-name.ts
rename to new-name.ts`;

export const RENAMED_WITH_CHANGES_DIFF = `diff --git a/old-name.ts b/new-name.ts
similarity index 87%
rename from old-name.ts
rename to new-name.ts
index 1234567..abcdefg 100644
--- a/old-name.ts
+++ b/new-name.ts
@@ -1,3 +1,4 @@
+import { updated } from './new-module';
 export function renamed() {
   return 'value';
 }`;

// Mock parsed diff data for tests that don't need the full parsing
export const MOCK_PARSED_DIFF = {
  files: [
    {
      path: 'src/app.ts',
      language: 'typescript',
      changeType: 'modified' as const,
      hunks: [
        {
          oldStart: 1,
          oldLines: 3,
          newStart: 1,
          newLines: 4,
          lines: [
            { type: 'add' as const, content: '+import { Logger } from \'./logger\';', newLineNumber: 1 },
            { type: 'context' as const, content: ' function main() {', oldLineNumber: 1, newLineNumber: 2 },
            { type: 'context' as const, content: '   console.log(\'Hello\');', oldLineNumber: 2, newLineNumber: 3 },
            { type: 'context' as const, content: ' }', oldLineNumber: 3, newLineNumber: 4 },
          ],
        },
      ],
    },
  ],
  stats: {
    filesChanged: 1,
    insertions: 1,
    deletions: 0,
  },
};
