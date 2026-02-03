import { http, HttpResponse } from 'msw';
import { MOCK_PARSED_DIFF } from '../fixtures/diffs';
import { MOCK_REVIEW_FEEDBACK } from '../fixtures/reviews';

/**
 * MSW handlers for mocking API requests in frontend tests
 */

export const handlers = [
  // GET /api/diff - Return mock parsed diff
  http.get('/api/diff', () => {
    return HttpResponse.json(MOCK_PARSED_DIFF);
  }),

  // POST /api/submit - Accept review feedback
  http.post('/api/submit', async ({ request }) => {
    const body = await request.json();
    // Simulate success response
    return HttpResponse.json({ success: true });
  }),

  // GET /api/history - Return mock review history
  http.get('/api/history', () => {
    return HttpResponse.json([MOCK_REVIEW_FEEDBACK]);
  }),
];

// Error handlers for testing error cases
export const errorHandlers = [
  http.get('/api/diff', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch diff' },
      { status: 500 }
    );
  }),

  http.post('/api/submit', () => {
    return HttpResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }),
];
