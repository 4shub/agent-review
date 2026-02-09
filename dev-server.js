#!/usr/bin/env node

/**
 * Development server for UI iteration
 * Serves the frontend with mock data and hot reload
 */

import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock diff data for development
const mockDiff = {
  files: [
    {
      path: 'src/app.ts',
      language: 'typescript',
      changeType: 'modified',
      hunks: [
        {
          oldStart: 10,
          oldLines: 5,
          newStart: 10,
          newLines: 6,
          lines: [
            { type: 'context', content: ' function calculateTotal(items: number[]) {', oldLineNumber: 10, newLineNumber: 10 },
            { type: 'delete', content: '-  let total = 0;', oldLineNumber: 11 },
            { type: 'add', content: '+  const total = 0;', newLineNumber: 11 },
            { type: 'context', content: '   for (const item of items) {', oldLineNumber: 12, newLineNumber: 12 },
            { type: 'add', content: '+    // Sum all items', newLineNumber: 13 },
            { type: 'context', content: '     total += item;', oldLineNumber: 13, newLineNumber: 14 },
            { type: 'context', content: '   }', oldLineNumber: 14, newLineNumber: 15 },
            { type: 'context', content: '   return total;', oldLineNumber: 15, newLineNumber: 16 },
          ],
        },
      ],
      isBinary: false,
    },
    {
      path: 'README.md',
      language: 'markdown',
      changeType: 'added',
      hunks: [
        {
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: 5,
          lines: [
            { type: 'add', content: '+# My Project', newLineNumber: 1 },
            { type: 'add', content: '+', newLineNumber: 2 },
            { type: 'add', content: '+This is a new project.', newLineNumber: 3 },
            { type: 'add', content: '+', newLineNumber: 4 },
            { type: 'add', content: '+## Features', newLineNumber: 5 },
          ],
        },
      ],
      isBinary: false,
    },
    {
      path: 'old-file.js',
      language: 'javascript',
      changeType: 'deleted',
      hunks: [
        {
          oldStart: 1,
          oldLines: 3,
          newStart: 0,
          newLines: 0,
          lines: [
            { type: 'delete', content: '-console.log("deprecated");', oldLineNumber: 1 },
            { type: 'delete', content: '-// TODO: Remove this', oldLineNumber: 2 },
            { type: 'delete', content: '-module.exports = {};', oldLineNumber: 3 },
          ],
        },
      ],
      isBinary: false,
    },
  ],
  stats: {
    filesChanged: 3,
    insertions: 8,
    deletions: 4,
  },
};

async function startDevServer() {
  const fastify = Fastify({ logger: true });

  // Serve static files from dist/public
  await fastify.register(fastifyStatic, {
    root: join(__dirname, 'dist/public'),
    prefix: '/',
  });

  // Mock API endpoints
  fastify.get('/api/diff', async () => {
    return mockDiff;
  });

  fastify.get('/api/health', async () => {
    return { status: 'ok', mode: 'development' };
  });

  fastify.post('/api/submit', async (request, reply) => {
    console.log('\n📋 Mock Review Submission:');
    console.log(JSON.stringify(request.body, null, 2));
    return { success: true };
  });

  // Start server
  const port = 3456;
  await fastify.listen({ port, host: '0.0.0.0' });

  console.log('\n🎨 Development UI Server');
  console.log(`   http://localhost:${port}`);
  console.log('\n📝 Mock diff data loaded');
  console.log('   - src/app.ts (modified)');
  console.log('   - README.md (added)');
  console.log('   - old-file.js (deleted)');
  console.log('\n✨ Edit files in src/frontend/ and refresh to see changes');
  console.log('   Run "npm run build" to rebuild the bundle\n');

  return fastify;
}

// Build frontend in watch mode
const watcher = spawn('node', ['esbuild.config.js', '--watch'], {
  stdio: 'inherit',
  shell: true,
});

watcher.on('error', (err) => {
  console.error('Failed to start build watcher:', err);
  process.exit(1);
});

// Start dev server
startDevServer().catch((err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down dev server...');
  watcher.kill();
  process.exit(0);
});
