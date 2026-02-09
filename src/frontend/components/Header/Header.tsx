/**
 * Header component - displays app title and diff stats
 */

import type { ParsedDiff } from '../../../shared/types';

interface HeaderProps {
  diff: ParsedDiff;
}

export function Header({ diff }: HeaderProps) {
  return (
    <header class="app-header">
      <h1>Code Review</h1>
      <div class="stats">
        <span class="stat">{diff.stats.filesChanged} files</span>
        <span class="stat additions">+{diff.stats.insertions}</span>
        <span class="stat deletions">-{diff.stats.deletions}</span>
      </div>
    </header>
  );
}
