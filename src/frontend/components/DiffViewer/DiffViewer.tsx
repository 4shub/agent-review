/**
 * DiffViewer component - displays file diffs
 */

import { signal, computed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { ParsedDiff, DiffFile, DiffHunk, DiffLine } from '../../../shared/types';
import { CommentThread } from '../CommentThread/CommentThread';
import { comments } from '../App/App';

const activeCommentLine = signal<string | null>(null);
const focusedLineIndex = signal<number>(0);

// Store all commentable lines for keyboard navigation
const commentableLines = signal<Array<{ lineKey: string; element?: HTMLElement }>>([]);

interface DiffViewerProps {
  diff: ParsedDiff;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  useEffect(() => {
    // Build list of all commentable lines
    const lines: Array<{ lineKey: string }> = [];
    
    for (const file of diff.files) {
      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          if (line.type !== 'context') {
            const lineIdentifier = line.type === 'delete' 
              ? `old-${line.oldLineNumber}`
              : `new-${line.newLineNumber || line.oldLineNumber}`;
            const lineKey = `${file.path}:${lineIdentifier}`;
            lines.push({ lineKey });
          }
        }
      }
    }
    
    commentableLines.value = lines;
    focusedLineIndex.value = 0;

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const totalLines = commentableLines.value.length;
      
      if (totalLines === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedLineIndex.value = Math.min(focusedLineIndex.value + 1, totalLines - 1);
        scrollToFocusedLine();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedLineIndex.value = Math.max(focusedLineIndex.value - 1, 0);
        scrollToFocusedLine();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const focusedLine = commentableLines.value[focusedLineIndex.value];
        if (focusedLine) {
          // Toggle comment thread
          if (activeCommentLine.value === focusedLine.lineKey) {
            activeCommentLine.value = null;
          } else {
            activeCommentLine.value = focusedLine.lineKey;
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        activeCommentLine.value = null;
      }
    };

    const scrollToFocusedLine = () => {
      const focusedLine = commentableLines.value[focusedLineIndex.value];
      if (focusedLine) {
        const element = document.querySelector(`[data-line-key="${focusedLine.lineKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diff]);

  return (
    <div class="diff-viewer">
      {diff.files.map((file) => (
        <FileViewer key={file.path} file={file} />
      ))}
    </div>
  );
}

interface FileViewerProps {
  file: DiffFile;
}

function FileViewer({ file }: FileViewerProps) {
  return (
    <div class="file-diff">
      <div class="file-header">
        <span class="file-path">{file.path}</span>
        <span class={`file-badge ${file.changeType}`}>{file.changeType}</span>
        {file.language && <span class="file-language">{file.language}</span>}
      </div>

      {file.isBinary ? (
        <div class="binary-file">Binary file</div>
      ) : (
        <div class="file-content">
          {file.hunks.map((hunk, idx) => (
            <HunkViewer key={idx} hunk={hunk} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

interface HunkViewerProps {
  hunk: DiffHunk;
  file: DiffFile;
}

function HunkViewer({ hunk, file }: HunkViewerProps) {
  return (
    <div class="hunk">
      <div class="hunk-header">
        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
        {hunk.header && <span class="hunk-context"> {hunk.header}</span>}
      </div>

      <table class="diff-table">
        <tbody>
          {hunk.lines.map((line, idx) => (
            <LineViewer key={idx} line={line} file={file} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface LineViewerProps {
  line: DiffLine;
  file: DiffFile;
}

function LineViewer({ line, file }: LineViewerProps) {
  // Create unique key based on line type to avoid collisions
  const lineIdentifier = line.type === 'delete' 
    ? `old-${line.oldLineNumber}`
    : `new-${line.newLineNumber || line.oldLineNumber}`;
  const lineKey = `${file.path}:${lineIdentifier}`;
  
  const hasComment = comments.value.has(lineKey);
  const isActive = activeCommentLine.value === lineKey;
  
  // Check if this line is focused via keyboard navigation
  const isFocused = computed(() => {
    if (line.type === 'context') return false;
    const focusedLine = commentableLines.value[focusedLineIndex.value];
    return focusedLine?.lineKey === lineKey;
  });

  const handleLineClick = () => {
    if (line.type !== 'context') {
      activeCommentLine.value = isActive ? null : lineKey;
    }
  };

  return (
    <>
      <tr
        class={`diff-line ${line.type} ${hasComment ? 'has-comment' : ''} ${isActive ? 'active' : ''} ${isFocused.value ? 'focused' : ''}`}
        onClick={handleLineClick}
        data-line-key={line.type !== 'context' ? lineKey : undefined}
      >
        <td class="line-number old">{line.oldLineNumber || ''}</td>
        <td class="line-number new">{line.newLineNumber || ''}</td>
        <td class="line-content">
          <pre>{line.content}</pre>
        </td>
      </tr>

      {isActive && (
        <tr class="comment-row">
          <td colSpan={3}>
            <CommentThread
              file={file.path}
              line={line.newLineNumber || line.oldLineNumber || 0}
              oldLine={line.oldLineNumber !== undefined ? line.oldLineNumber : undefined}
              context={line.content}
              lineKey={lineKey}
              onClose={() => (activeCommentLine.value = null)}
            />
          </td>
        </tr>
      )}

      {hasComment && !isActive && (
        <tr class="comment-preview" onClick={handleLineClick}>
          <td colSpan={3}>
            <div class="comment-bubble">
              💬 {comments.value.get(lineKey)?.comment}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
