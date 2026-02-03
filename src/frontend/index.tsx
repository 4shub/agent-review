/**
 * Frontend Preact application
 */

import { render } from 'preact';
import { signal, computed } from '@preact/signals';
import { App } from './components/App';

// Mount app
const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
