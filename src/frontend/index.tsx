/**
 * Frontend Preact application
 */

import { render } from 'preact';
import { App } from './components/App';

// Mount app
const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
