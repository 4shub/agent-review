/**
 * DiffViewer component - displays file diffs
 */

import { signal } from '@preact/signals';
import type { ParsedDiff, DiffFile, DiffHunk, DiffLine } from '../../shared/types';
import { CommentThread } from './CommentThread';
import { comments } from './App';

const activeCommentLine = signal<string | null>(null);

interface DiffViewerProps {
  diff: ParsedDiff;
}

export function DiffViewer({ diff }: DiffViewerProps) {
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
  const lineKey = `${file.path}:${line.newLineNumber || line.oldLineNumber}`;
  const hasComment = comments.value.has(lineKey);
  const isActive = activeCommentLine.value === lineKey;

  const handleLineClick = () => {
    if (line.type !== 'context') {
      activeCommentLine.value = isActive ? null : lineKey;
    }
  };

  return (
    <>
      <tr
        class={`diff-line ${line.type} ${hasComment ? 'has-comment' : ''} ${isActive ? 'active' : ''}`}
        onClick={handleLineClick}
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
              oldLine={line.oldLineNumber}
              context={line.content}
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
