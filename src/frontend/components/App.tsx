/**
 * Main App component
 */

import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { ParsedDiff, LineComment } from '../../shared/types';
import { DiffViewer } from './DiffViewer';
import { ReviewPanel } from './ReviewPanel';

// Global state
export const diffData = signal<ParsedDiff | null>(null);
export const comments = signal<Map<string, LineComment>>(new Map());
export const generalFeedback = signal<string>('');
export const isLoading = signal<boolean>(true);
export const error = signal<string | null>(null);

export function App() {
  useEffect(() => {
    // Fetch diff data on mount
    fetchDiff();
  }, []);

  const fetchDiff = async () => {
    try {
      isLoading.value = true;
      const response = await fetch('/api/diff');
      
      if (!response.ok) {
        throw new Error('Failed to fetch diff');
      }

      const data = await response.json();
      diffData.value = data;
      isLoading.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      isLoading.value = false;
    }
  };

  if (isLoading.value) {
    return (
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading diff...</p>
      </div>
    );
  }

  if (error.value) {
    return (
      <div class="error">
        <h2>Error</h2>
        <p>{error.value}</p>
      </div>
    );
  }

  if (!diffData.value) {
    return (
      <div class="empty">
        <p>No diff data available</p>
      </div>
    );
  }

  return (
    <div class="app">
      <header class="app-header">
        <h1>Code Review</h1>
        <div class="stats">
          <span class="stat">{diffData.value.stats.filesChanged} files</span>
          <span class="stat additions">+{diffData.value.stats.insertions}</span>
          <span class="stat deletions">-{diffData.value.stats.deletions}</span>
        </div>
      </header>

      <main class="app-main">
        <DiffViewer diff={diffData.value} />
      </main>

      <ReviewPanel />
    </div>
  );
}
