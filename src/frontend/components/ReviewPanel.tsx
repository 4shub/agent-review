/**
 * ReviewPanel component - submit review feedback
 */

import { signal, computed } from '@preact/signals';
import { comments, generalFeedback, diffData } from './App';
import type { ReviewFeedback } from '../../shared/types';

const commentCount = computed(() => comments.value.size);
const commitMessage = signal<string>('');

export function ReviewPanel() {
  const handleSubmit = async (shouldCommit: boolean) => {
    try {
      // Validate commit message if committing
      if (shouldCommit && !commitMessage.value.trim()) {
        alert('Please enter a commit message');
        return;
      }

      const feedback: ReviewFeedback = {
        timestamp: new Date().toISOString(),
        lineComments: Array.from(comments.value.values()),
        generalFeedback: generalFeedback.value,
        stats: {
          filesReviewed: diffData.value?.files.length || 0,
          commentsAdded: comments.value.size,
        },
      };

      const payload = {
        feedback,
        commit: shouldCommit ? {
          message: commitMessage.value.trim(),
        } : undefined,
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Show success message briefly, then close window
      const successDiv = document.createElement('div');
      successDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#3fb950;color:#fff;padding:2rem 3rem;border-radius:8px;font-size:1.2rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.5)';
      successDiv.textContent = '✅ Review submitted successfully!';
      document.body.appendChild(successDiv);

      // Close window after 1 second
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      alert('Error submitting review: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div class="review-panel">
      <div class="review-summary">
        <div class="summary-item">
          <span class="summary-label">Line Comments:</span>
          <span class="summary-value">{commentCount.value}</span>
        </div>
      </div>

      <div class="general-feedback-section">
        <label class="feedback-label">General Feedback</label>
        <textarea
          class="general-feedback-input"
          placeholder="Add overall feedback about the changes..."
          value={generalFeedback.value}
          onInput={(e) => (generalFeedback.value = (e.target as HTMLTextAreaElement).value)}
          rows={3}
        />
      </div>

      <div class="commit-message-section">
        <label class="feedback-label">Commit Message (optional)</label>
        <input
          type="text"
          class="commit-message-input"
          placeholder="Enter commit message to commit changes after review..."
          value={commitMessage.value}
          onInput={(e) => (commitMessage.value = (e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="review-actions">
        <button class="btn btn-submit" onClick={() => handleSubmit(false)}>
          Submit Review Only
        </button>
        <button 
          class="btn btn-commit" 
          onClick={() => handleSubmit(true)}
          disabled={!commitMessage.value.trim()}
        >
          Submit Review & Commit
        </button>
      </div>
    </div>
  );
}
