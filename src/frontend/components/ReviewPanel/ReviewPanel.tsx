/**
 * ReviewPanel component - submit review feedback
 */

import { signal, computed } from '@preact/signals';
import { comments, generalFeedback, diffData } from '../App/App';
import type { ReviewFeedback } from '../../../shared/types';

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

      // Replace entire page with success message
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;background:#0d1117;color:#c9d1d9;">
          <div style="text-align:center;">
            <div style="font-size:4rem;margin-bottom:1rem;">✅</div>
            <h1 style="font-size:2rem;margin-bottom:1rem;color:#3fb950;">Review Submitted Successfully!</h1>
            <p style="font-size:1.2rem;color:#8b949e;">You can close this window now</p>
            <p style="font-size:0.9rem;color:#6e7681;margin-top:2rem;">Window will close automatically in 3 seconds...</p>
          </div>
        </div>
      `;

      // Try to close window after delay
      setTimeout(() => {
        window.close();
        // If close doesn't work (cross-browser restrictions), redirect to blank page
        setTimeout(() => {
          window.location.href = 'about:blank';
        }, 100);
      }, 3000);
    } catch (error) {
      alert('Error submitting review: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div class="review-panel">
      <div class="review-header">
        Feedback Overview
      </div>
      <div className="review-content">

        <div className="general-feedback-section">
          <label className="feedback-label">General Feedback</label>
          <textarea
              className="general-feedback-input"
              placeholder="Add overall feedback about the changes..."
              value={generalFeedback.value}
              onInput={(e) => (generalFeedback.value = (e.target as HTMLTextAreaElement).value)}
              rows={3}
          />
        </div>

        <div className="commit-message-section">
          <label className="feedback-label">Commit Message (optional)</label>
          <input
              type="text"
              className="general-feedback-input"
              placeholder="Enter commit message to commit changes after review..."
              value={commitMessage.value}
              onInput={(e) => (commitMessage.value = (e.target as HTMLInputElement).value)}
          />
        </div>

        <div className="review-actions">
          <button className="btn btn-submit" onClick={() => handleSubmit(false)}>
            Submit Review Only
          </button>
          <button
              className="btn btn-commit"
              onClick={() => handleSubmit(true)}
              disabled={!commitMessage.value.trim()}
          >
            Submit Review & Commit
          </button>
        </div>
      </div>
    </div>
  );
}
