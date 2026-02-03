import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

// Shared build options
const commonOptions = {
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  logLevel: 'info',
};

// CLI/Server bundle
const serverBuild = {
  ...commonOptions,
  entryPoints: [join(__dirname, 'src/cli/index.ts')],
  outfile: join(__dirname, 'dist/cli/index.js'),
  external: [
    'fastify',
    '@fastify/static',
    'simple-git',
    'commander',
    'open',
  ],
  banner: {
    js: '#!/usr/bin/env node\n',
  },
};

// Frontend bundle
const frontendBuild = {
  ...commonOptions,
  entryPoints: [join(__dirname, 'src/frontend/index.tsx')],
  outfile: join(__dirname, 'dist/public/app.js'),
  platform: 'browser',
  format: 'esm',
  target: ['es2022', 'chrome100', 'firefox100', 'safari15'],
  external: [], // Bundle everything for frontend
  jsx: 'automatic',
  jsxImportSource: 'preact',
  splitting: false, // Enable once we have code splitting strategy
  treeShaking: true,
  metafile: true, // For bundle analysis
};

// Copy static assets
import { copyFileSync, mkdirSync } from 'fs';

function copyStaticAssets() {
  try {
    mkdirSync(join(__dirname, 'dist/public'), { recursive: true });
    
    // Copy CSS
    copyFileSync(
      join(__dirname, 'src/frontend/styles/main.css'),
      join(__dirname, 'dist/public/styles.css')
    );
    
    // Copy HTML
    copyFileSync(
      join(__dirname, 'public/index.html'),
      join(__dirname, 'dist/public/index.html')
    );
    
    console.log('📝 Copied static assets');
  } catch (error) {
    console.error('Error copying assets:', error);
  }
}

async function build() {
  try {
    console.log('🔨 Building server bundle...');
    const serverResult = await (isWatch
      ? esbuild.context(serverBuild).then(ctx => ctx.watch())
      : esbuild.build(serverBuild));

    console.log('🎨 Building frontend bundle...');
    const frontendResult = await (isWatch
      ? esbuild.context(frontendBuild).then(ctx => ctx.watch())
      : esbuild.build(frontendBuild));

    // Copy static assets
    copyStaticAssets();

    // Analyze bundle size
    if (frontendResult?.metafile) {
      const analysis = await esbuild.analyzeMetafile(frontendResult.metafile, {
        verbose: false,
      });
      console.log('\n📊 Frontend bundle analysis:');
      console.log(analysis);
      
      // Calculate and display size
      const outputs = Object.values(frontendResult.metafile.outputs);
      const totalSize = outputs.reduce((sum, output) => sum + output.bytes, 0);
      const sizeKb = (totalSize / 1024).toFixed(2);
      console.log(`\n📦 Total frontend bundle size: ${sizeKb} KB`);
      
      if (totalSize > 100 * 1024) {
        console.warn('⚠️  Warning: Frontend bundle exceeds 100KB target!');
      } else {
        console.log('✅ Frontend bundle size is within 100KB target');
      }
    }

    if (isWatch) {
      console.log('\n👀 Watching for changes...');
    } else {
      console.log('\n✅ Build complete!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
