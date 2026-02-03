/**
 * Test fixtures for review feedback data
 */

export const MOCK_LINE_COMMENTS = [
  {
    file: 'src/app.ts',
    line: 10,
    oldLine: 9,
    comment: 'Consider using const instead of let here',
    context: 'let x = 5;',
  },
  {
    file: 'src/app.ts',
    line: 15,
    oldLine: 14,
    comment: 'This function could be simplified',
    context: 'function complex() { /* ... */ }',
  },
  {
    file: 'src/utils.ts',
    line: 5,
    comment: 'Good use of type guards!',
    context: 'if (typeof x === "string") {',
  },
];

export const MOCK_REVIEW_FEEDBACK = {
  timestamp: '2026-02-03T16:30:00.000Z',
  lineComments: MOCK_LINE_COMMENTS,
  generalFeedback: 'Overall the code looks good. Just a few minor suggestions.',
  stats: {
    filesReviewed: 2,
    commentsAdded: 3,
  },
};

export const EMPTY_REVIEW_FEEDBACK = {
  timestamp: '2026-02-03T16:30:00.000Z',
  lineComments: [],
  generalFeedback: '',
  stats: {
    filesReviewed: 0,
    commentsAdded: 0,
  },
};
