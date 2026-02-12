/**
 * Header component - displays app title and diff stats
 */

import type { ParsedDiff } from '../../../shared/types';

interface HeaderProps {
  diff: ParsedDiff;
}

export function Header({ diff }: HeaderProps) {
  return (
      <header className="app-header">
          <h1>Code Review</h1>
          <div className="stats">
              <span className="stat">{diff.stats.filesChanged} files</span>
              <span className="stat additions">+{diff.stats.insertions}</span>
              <span className="stat deletions">-{diff.stats.deletions}</span>
          </div>
      </header>
  );
}
