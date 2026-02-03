/**
 * ReviewPanel component - submit review feedback
 */

import { computed } from '@preact/signals';
import { comments, generalFeedback, diffData } from './App';
import type { ReviewFeedback } from '../../shared/types';

const commentCount = computed(() => comments.value.size);

export function ReviewPanel() {
  const handleSubmit = async () => {
    try {
      const feedback: ReviewFeedback = {
        timestamp: new Date().toISOString(),
        lineComments: Array.from(comments.value.values()),
        generalFeedback: generalFeedback.value,
        stats: {
          filesReviewed: diffData.value?.files.length || 0,
          commentsAdded: comments.value.size,
        },
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Show success message
      alert('Review submitted successfully! You can close this window.');
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
          rows={4}
        />
      </div>

      <div class="review-actions">
        <button class="btn btn-submit" onClick={handleSubmit}>
          Submit Review
        </button>
      </div>
    </div>
  );
}
