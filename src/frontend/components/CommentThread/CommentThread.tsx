/**
 * CommentThread component - inline comment editor
 */

import { useState } from 'preact/hooks';
import type { LineComment } from '../../../shared/types';
import { comments } from '../App/App';

interface CommentThreadProps {
  file: string;
  line: number;
  oldLine?: number;
  context: string;
  lineKey: string;
  onClose: () => void;
}

export function CommentThread({ file, line, oldLine, context, lineKey, onClose }: CommentThreadProps) {
  const existingComment = comments.value.get(lineKey);
  
  const [commentText, setCommentText] = useState(existingComment?.comment || '');

  const handleSave = () => {
    if (commentText.trim()) {
      const comment: LineComment = {
        file,
        line,
        oldLine: oldLine !== undefined ? oldLine : undefined,
        comment: commentText.trim(),
        context: context.trim(),
      };

      // Update comments map
      const newComments = new Map(comments.value);
      newComments.set(lineKey, comment);
      comments.value = newComments;
    }
    onClose();
  };

  const handleDelete = () => {
    const newComments = new Map(comments.value);
    newComments.delete(lineKey);
    comments.value = newComments;
    onClose();
  };

  return (
    <div class="comment-thread">
      <div class="comment-header">
        <span class="comment-location">
          Comment on line {line}
        </span>
      </div>

      <div className="comment-editor">
        <textarea
            autofocus
            onKeyPress={(e) => {
              if (e.shiftKey && e.key === 'Enter') {
                handleSave()
              }
            }}
            className="comment-input"
            placeholder="Add your comment..."
            value={commentText}
            onInput={(e) => setCommentText((e.target as HTMLTextAreaElement).value)}
            rows={3}
            autoFocus
        />

        <div className="comment-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            {existingComment ? 'Update' : 'Save'} Comment (shift+enter)
          </button>

          {existingComment && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
          )}

          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
