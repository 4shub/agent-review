import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startReviewServer } from '../../src/server/index';
import { MOCK_PARSED_DIFF } from '../fixtures/diffs';
import { MOCK_REVIEW_FEEDBACK } from '../fixtures/reviews';
import type { ServerResult } from '@/shared/types';

describe('API Integration Tests', () => {
  let server: ServerResult;
  let baseUrl: string;

  beforeAll(async () => {
    // Start server on random port for testing
    server = await startReviewServer(MOCK_PARSED_DIFF, {
      port: 0, // Random available port
      open: false, // Don't open browser during tests
    });
    baseUrl = server.url;
  });

  afterAll(async () => {
    await server.shutdown();
  });

  describe('GET /api/diff', () => {
    it('should return parsed diff data', async () => {
      const response = await fetch(`${baseUrl}/api/diff`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('files');
      expect(data).toHaveProperty('stats');
      expect(Array.isArray(data.files)).toBe(true);
    });

    it('should return correct diff structure', async () => {
      const response = await fetch(`${baseUrl}/api/diff`);
      const data = await response.json();

      expect(data.files).toHaveLength(1);
      expect(data.files[0]).toHaveProperty('path');
      expect(data.files[0]).toHaveProperty('language');
      expect(data.files[0]).toHaveProperty('changeType');
      expect(data.files[0]).toHaveProperty('hunks');
    });

    it('should return correct stats', async () => {
      const response = await fetch(`${baseUrl}/api/diff`);
      const data = await response.json();

      expect(data.stats).toHaveProperty('filesChanged');
      expect(data.stats).toHaveProperty('insertions');
      expect(data.stats).toHaveProperty('deletions');
      expect(typeof data.stats.filesChanged).toBe('number');
    });
  });

  describe('POST /api/submit', () => {
    it('should accept valid feedback', async () => {
      const feedback = {
        timestamp: new Date().toISOString(),
        lineComments: [
          {
            file: 'test.ts',
            line: 5,
            comment: 'Test comment',
            context: 'const x = 5;',
          },
        ],
        generalFeedback: 'Looks good!',
        stats: {
          filesReviewed: 1,
          commentsAdded: 1,
        },
      };

      const response = await fetch(`${baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid feedback (missing lineComments)', async () => {
      const invalidFeedback = {
        timestamp: new Date().toISOString(),
        generalFeedback: 'Missing lineComments',
        stats: {},
      };

      const response = await fetch(`${baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidFeedback),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject invalid content type', async () => {
      const response = await fetch(`${baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'invalid',
      });

      expect(response.status).toBe(400);
    });

    it('should reject empty body', async () => {
      const response = await fetch(`${baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
    });

    it('should return valid ISO timestamp', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();

      const timestamp = new Date(data.timestamp);
      expect(timestamp.toISOString()).toBe(data.timestamp);
    });
  });

  describe('GET /', () => {
    it('should serve index.html', async () => {
      const response = await fetch(`${baseUrl}/`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });
  });

  describe('Server lifecycle', () => {
    it('should resolve feedback promise when feedback is submitted', async () => {
      // Start a new server for this test
      const testServer = await startReviewServer(MOCK_PARSED_DIFF, {
        port: 0,
        open: false,
      });

      const feedback = {
        timestamp: new Date().toISOString(),
        lineComments: [],
        generalFeedback: 'Test',
        stats: { filesReviewed: 0, commentsAdded: 0 },
      };

      // Submit feedback
      await fetch(`${testServer.url}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      // Wait for feedback promise to resolve
      const resolvedFeedback = await testServer.feedback;

      expect(resolvedFeedback).toEqual(feedback);

      await testServer.shutdown();
    });

    it('should shutdown gracefully', async () => {
      const testServer = await startReviewServer(MOCK_PARSED_DIFF, {
        port: 0,
        open: false,
      });

      await expect(testServer.shutdown()).resolves.not.toThrow();

      // Server should no longer respond
      await expect(
        fetch(`${testServer.url}/api/health`)
      ).rejects.toThrow();
    });
  });
});
