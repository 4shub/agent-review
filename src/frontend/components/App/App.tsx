/**
 * Main App component
 */

import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { ParsedDiff, LineComment } from '../../../shared/types';
import { Header } from '../Header/Header';
import { DiffViewer } from '../DiffViewer/DiffViewer';
import { ReviewPanel } from '../ReviewPanel/ReviewPanel';

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
      <Header diff={diffData.value} />
      <main class="app-main">
        <div class="diff-container">
          <DiffViewer diff={diffData.value} />
        </div>
        <ReviewPanel />
      </main>


    </div>
  );
}
