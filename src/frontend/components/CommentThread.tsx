/**
 * CommentThread component - inline comment editor
 */

import { useState } from 'preact/hooks';
import type { LineComment } from '../../shared/types';
import { comments } from './App';

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

      <textarea
        class="comment-input"
        placeholder="Add your comment..."
        value={commentText}
        onInput={(e) => setCommentText((e.target as HTMLTextAreaElement).value)}
        rows={3}
        autoFocus
      />

      <div class="comment-actions">
        <button class="btn btn-primary" onClick={handleSave}>
          {existingComment ? 'Update' : 'Save'} Comment
        </button>
        
        {existingComment && (
          <button class="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
        
        <button class="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
