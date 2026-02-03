#!/usr/bin/env node

/**
 * CLI entry point for code-review tool
 */

import { Command } from 'commander';
import { getDiff } from '../git/diff-service.js';
import { startReviewServer } from '../server/index.js';
import { DEFAULT_PORT } from '../shared/constants.js';

const program = new Command();

program
  .name('code-review')
  .description('Launch interactive code review UI for git changes')
  .version('0.1.0')
  .option('-p, --port <number>', 'Server port', String(DEFAULT_PORT))
  .option('--no-open', "Don't auto-open browser")
  .option('--staged', 'Review only staged changes (--cached)')
  .action(async (options) => {
    try {
      console.log('🔍 Fetching git diff...');
      
      // Get git diff
      const diff = await getDiff({
        staged: options.staged || false,
      });

      // Check if there are changes
      if (diff.files.length === 0) {
        console.log('✨ No changes to review!');
        process.exit(0);
      }

      console.log(`📝 Found ${diff.files.length} file(s) with changes`);
      console.log(`   +${diff.stats.insertions} -${diff.stats.deletions}`);
      console.log('');
      console.log('🚀 Starting review server...');

      // Start server
      const server = await startReviewServer(diff, {
        port: parseInt(options.port, 10),
        open: options.open !== false,
      });

      console.log(`✅ Server running at ${server.url}`);
      console.log('');
      console.log('👀 Waiting for review...');
      console.log('   (Press Ctrl+C to cancel)');
      console.log('');

      // Wait for feedback
      const feedback = await server.feedback;

      // Shutdown server
      await server.shutdown();

      console.log('');
      console.log('📋 Review completed!');
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('REVIEW FEEDBACK');
      console.log('═══════════════════════════════════════════');
      console.log('');

      if (feedback.lineComments.length > 0) {
        console.log(`📌 Line Comments (${feedback.lineComments.length}):`);
        console.log('');
        
        for (const comment of feedback.lineComments) {
          console.log(`  📄 ${comment.file}:${comment.line}`);
          console.log(`     ${comment.context}`);
          console.log(`     💬 ${comment.comment}`);
          console.log('');
        }
      }

      if (feedback.generalFeedback) {
        console.log('💭 General Feedback:');
        console.log(`   ${feedback.generalFeedback}`);
        console.log('');
      }

      console.log('═══════════════════════════════════════════');
      console.log('');
      console.log('✨ Review saved!');

      process.exit(0);
    } catch (error) {
      console.error('');
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      console.error('');
      process.exit(1);
    }
  });

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('');
  console.log('⚠️  Review cancelled');
  process.exit(130);
});

program.parse();
