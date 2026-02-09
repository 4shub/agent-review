# Agent Review 

> 🚀 A lighweight tool for you to review your agent's code changes

`agent-review` is a CLI tool that lets you review your AI agent's code and feedback to it without leaving your computer.

## How it works
Add the skill `npx skills add `

## ✨ Features

- 🎨 **GitHub-style UI** - Familiar dark theme with syntax highlighting
- 💬 **Inline comments** - Click any changed line to add comments
- 📝 **Git integration** - Shows all uncommitted changes including untracked files
- 🤖 **AI-friendly output** - Structured JSON feedback for coding agents
- ⚡ **Lightning fast** - 26KB bundle, starts in <2 seconds
- 🔄 **Auto-commit option** - Review and commit in one step
- 🌐 **Auto-opens browser** - Seamless workflow

## 🚀 Quick Start

```bash
# Run directly with npx (no installation needed)
npx agent-review

# Or install globally
npm install -g agent-review

# Then run from any git repo
agent-review
```

## 📖 Usage

### Basic Usage

```bash
# Review all uncommitted changes
agent-review

# Review only staged changes
agent-review --staged

# Use custom port
agent-review --port 8080

# Don't auto-open browser
agent-review --no-open
```

### In the UI

1. **Browse changes** - See all modified, added, and deleted files
2. **Add inline comments** - Click any green (+) or red (-) line
3. **Add general feedback** - Use the text area at the bottom
4. **Optional: Enter commit message** - If you want to commit after review
5. **Submit** - Choose "Review Only" or "Review & Commit"

### Output

The tool outputs structured JSON feedback that AI agents can parse:

```json
{
  "timestamp": "2026-02-03T17:23:33.377Z",
  "lineComments": [
    {
      "file": "src/app.ts",
      "line": 42,
      "oldLine": 41,
      "comment": "Consider using const instead of let",
      "context": "let x = calculateTotal();"
    }
  ],
  "generalFeedback": "Overall looks good, just a few minor suggestions",
  "stats": {
    "filesReviewed": 5,
    "commentsAdded": 3
  }
}
```

Review data is also saved to `.agent-review/latest-review.json` for programmatic access.

## 🤖 For AI Coding Agents

This tool is designed to integrate seamlessly with AI coding agents.

### Letta Code Skill

A `.skills/agent-review/SKILL.md` is included that teaches Letta Code agents how to properly use this tool:

- ✅ Run inline (not background) with long timeout (10 min)
- ✅ Automatically read feedback from `.agent-review/latest-review.json`
- ✅ Process line comments and general feedback
- ✅ Handle commit option correctly

Agents using this skill will automatically request reviews at appropriate times.

### Manual Integration

```typescript
// Example: Using with an AI agent
async function getCodeReview() {
  // Run agent-review CLI (MUST be inline, NOT background)
  exec('agent-review --port 3456');
  
  // Wait for user to complete review
  // ... (tool blocks until submission)
  
  // Read structured feedback
  const review = JSON.parse(
    fs.readFileSync('.agent-review/latest-review.json', 'utf-8')
  );
  
  // Process feedback
  for (const comment of review.feedback.lineComments) {
    console.log(`${comment.file}:${comment.line} - ${comment.comment}`);
  }
}
```

## 📦 What's Included

- **Zero configuration** - Works out of the box in any git repository
- **Lightweight** - Only 7 production dependencies
- **TypeScript** - Fully typed with strict mode
- **Well tested** - 93%+ test coverage
- **Fast builds** - esbuild for instant compilation

## 🛠️ Development

```bash
# Clone the repo
git clone git@github.com:4shub/agent-review.git
cd agent-review

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Run locally
npm start
```

## 📋 Requirements

- Node.js >= 18.0.0
- Git repository

## 🏗️ Architecture

```
CLI (Commander.js)
  ↓
Git Service (simple-git)
  ↓ parses diff
Server (Fastify)
  ↓ serves
UI (Preact + Signals)
  ↓ submits feedback
Storage (JSON files)
```

## 🎯 Bundle Size

- **Frontend**: 26.5 KB minified
- **CLI/Server**: 8.9 KB minified
- **Total dependencies**: 7 production packages

## 📄 License

MIT

## 🙏 Credits

Built with:
- [Preact](https://preactjs.com/) - Fast 3KB React alternative
- [Fastify](https://www.fastify.io/) - High performance web framework
- [simple-git](https://github.com/steveukx/git-js) - Git command wrapper
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [esbuild](nhttps://esbuild.github.io/) - Extremely fast bundler

---

**Made with ❤️ for AI coding agents**
