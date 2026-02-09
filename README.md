# Agent Review 

> 🚀 A lightweight tool for you to review your agent's code changes

`agent-review` is a CLI tool that lets you review your AI agent's code and feedback to it without leaving your computer.

## How it works
Add the skill `npx skills add 4shub/agent-review` to your preferred coding agent or ask your agent to run `npx agent-review` with a high timeout.

## ✨ Features
- 💬 **Inline comments** - Click any changed line to add comments
- 📝 **Git integration** - Shows all uncommitted changes including untracked files
- 🤖 **AI-friendly output** - Structured JSON feedback for coding agents
- ⚡ **Lightning fast** - 26KB bundle, starts in <2 seconds
- 🔄 **Auto-commit option** - Review and commit in one step

##  Contributing
We always love contributions! You're free to use AI but please make sure you review your code, preferrably with this extension as well :)

```bash
# Clone the repo
git clone git@github.com:4shub/agent-review.git
cd agent-review

# Install dependencies
npm install

# Start dev server with mock data (for UI development)
npm run dev:web
# Opens at http://localhost:3456 with:
# - Mock diff data (3 sample files)
# - Hot reload (auto-rebuilds on file changes)
# - No git required - perfect for UI iteration!

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Run locally (requires git repo with changes)
npm start
```

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
