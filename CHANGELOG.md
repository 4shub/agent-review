# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-03

### Added
- Initial release of agent-review CLI tool
- GitHub-style diff viewer with dark theme
- Inline comment system (click any changed line)
- Review panel with general feedback
- Optional commit integration (review & commit in one step)
- Untracked file support (shows brand new files)
- Auto-save review feedback to `.agent-review/latest-review.json`
- Auto-open browser on launch
- Structured JSON output for AI agents
- Full TypeScript support with strict mode
- Comprehensive test suite (93%+ coverage)

### Features
- 26KB frontend bundle (Preact-based)
- Lightning fast startup (<2 seconds)
- Zero configuration required
- Works in any git repository
- Beautiful, responsive UI
- Keyboard-friendly interface

### Technical
- Built with Fastify, Preact, simple-git, Commander.js
- esbuild for ultra-fast builds
- Vitest for testing
- TypeScript with strict mode
