/**
 * Fastify server for code review UI
 */

import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ParsedDiff, ReviewFeedback, ServerOptions, ServerResult } from '@/shared/types';
import { ServerError } from '@/shared/types';
import { DEFAULT_PORT, DEFAULT_HOST, SERVER_SHUTDOWN_TIMEOUT_MS } from '@/shared/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Start the review server
 * 
 * @param diff - Parsed diff data to display
 * @param options - Server configuration options
 * @returns Server control object with URL, feedback promise, and shutdown function
 */
export async function startReviewServer(
  diff: ParsedDiff,
  options: Partial<ServerOptions> = {}
): Promise<ServerResult> {
  const { port = DEFAULT_PORT, open: shouldOpen = true } = options;

  // Create Fastify instance
  const fastify: FastifyInstance = Fastify({
    logger: false,
    disableRequestLogging: true,
  });

  // Store submitted feedback (will be resolved when user submits)
  let feedbackResolver: ((feedback: ReviewFeedback) => void) | null = null;
  const feedbackPromise = new Promise<ReviewFeedback>((resolve) => {
    feedbackResolver = resolve;
  });

  // Register routes
  registerRoutes(fastify, diff, feedbackResolver);

  // Serve static files (frontend)
  await registerStaticFiles(fastify);

  // Start server
  try {
    await fastify.listen({ port, host: DEFAULT_HOST });
    
    // Get the actual port (important when port=0 for random port)
    const address = fastify.server.address();
    const actualPort = typeof address === 'object' && address !== null ? address.port : port;
    const url = `http://${DEFAULT_HOST}:${actualPort}`;

    // Auto-open browser if requested
    if (shouldOpen) {
      await openBrowser(url);
    }

    return {
      url,
      feedback: feedbackPromise,
      shutdown: async () => {
        await shutdownServer(fastify);
      },
    };
  } catch (error) {
    throw new ServerError(
      'Failed to start server',
      500,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Register API routes
 */
function registerRoutes(
  fastify: FastifyInstance,
  diff: ParsedDiff,
  feedbackResolver: ((feedback: ReviewFeedback) => void) | null
): void {
  // GET /api/diff - Return parsed diff
  fastify.get('/api/diff', async (request, reply) => {
    return diff;
  });

  // POST /api/submit - Accept review feedback
  fastify.post<{ Body: ReviewFeedback }>('/api/submit', async (request, reply) => {
    const feedback = request.body;

    // Validate feedback
    if (!feedback || typeof feedback !== 'object') {
      reply.code(400).send({ error: 'Invalid feedback format' });
      return;
    }

    if (!Array.isArray(feedback.lineComments)) {
      reply.code(400).send({ error: 'lineComments must be an array' });
      return;
    }

    // Resolve the feedback promise
    if (feedbackResolver) {
      feedbackResolver(feedback);
    }

    return { success: true };
  });

  // GET /api/health - Health check
  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}

/**
 * Register static file serving for frontend assets
 */
async function registerStaticFiles(fastify: FastifyInstance): Promise<void> {
  // Serve frontend from public directory
  // When built: __dirname is dist/server, so ../../public is correct
  // When running tests: __dirname is src/server, so ../../public is also correct
  const publicDir = join(__dirname, '../../public');
  
  try {
    await fastify.register(fastifyStatic, {
      root: publicDir,
      prefix: '/',
    });
  } catch (error) {
    console.warn('Could not register static files:', error);
    // Don't fail if static files aren't available yet
  }
}

/**
 * Shutdown server gracefully
 */
async function shutdownServer(fastify: FastifyInstance): Promise<void> {
  try {
    await fastify.close();
  } catch (error) {
    // Force close if graceful shutdown fails
    console.error('Error during graceful shutdown, forcing close');
    await Promise.race([
      fastify.close(),
      new Promise((resolve) => setTimeout(resolve, SERVER_SHUTDOWN_TIMEOUT_MS)),
    ]);
  }
}

/**
 * Open URL in default browser
 */
async function openBrowser(url: string): Promise<void> {
  try {
    const open = (await import('open')).default;
    await open(url);
  } catch (error) {
    // Silently fail if we can't open browser
    console.warn('Could not open browser automatically');
  }
}
