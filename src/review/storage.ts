/**
 * Review storage - saves reviews to local files
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { ReviewFeedback, StoredReview, ParsedDiff } from '@/shared/types';
import { REVIEW_STORAGE_DIR, REVIEWS_SUBDIR } from '@/shared/constants';

/**
 * Save review feedback to disk
 * Saves to both:
 * - .code-review/latest-review.json (for AI agent to read immediately)
 * - .code-review/reviews/{timestamp}.json (for history)
 */
export function saveReview(feedback: ReviewFeedback, diff?: ParsedDiff): void {
  const storageDir = join(process.cwd(), REVIEW_STORAGE_DIR);
  const reviewsDir = join(storageDir, REVIEWS_SUBDIR);

  // Create directories if they don't exist
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }
  if (!existsSync(reviewsDir)) {
    mkdirSync(reviewsDir, { recursive: true });
  }

  // Create stored review object
  const storedReview: StoredReview = {
    id: `review-${Date.now()}`,
    timestamp: feedback.timestamp,
    diff: diff || { files: [], stats: { filesChanged: 0, insertions: 0, deletions: 0 } },
    feedback,
  };

  // Save to latest-review.json (for AI agent)
  const latestPath = join(storageDir, 'latest-review.json');
  writeFileSync(latestPath, JSON.stringify(storedReview, null, 2), 'utf-8');

  // Save to timestamped file (for history)
  const historyPath = join(reviewsDir, `${storedReview.id}.json`);
  writeFileSync(historyPath, JSON.stringify(storedReview, null, 2), 'utf-8');
}

/**
 * Get the path to the latest review file
 */
export function getLatestReviewPath(): string {
  return join(process.cwd(), REVIEW_STORAGE_DIR, 'latest-review.json');
}

/**
 * Save the current git commit hash as the last reviewed commit
 */
export function saveLastReviewedCommit(commitHash: string): void {
  const storageDir = join(process.cwd(), REVIEW_STORAGE_DIR);
  
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  const markerPath = join(storageDir, 'last-reviewed-commit.txt');
  writeFileSync(markerPath, commitHash, 'utf-8');
}

/**
 * Get the last reviewed commit hash (if any)
 */
export function getLastReviewedCommit(): string | null {
  const markerPath = join(process.cwd(), REVIEW_STORAGE_DIR, 'last-reviewed-commit.txt');
  
  if (!existsSync(markerPath)) {
    return null;
  }

  try {
    return readFileSync(markerPath, 'utf-8').trim();
  } catch {
    return null;
  }
}
