# System Prompt Analysis & Auto-Repair Tool

A production-ready web application that ingests system prompts, auto-generates user interaction scenarios, runs evaluations across selected LLMs, discovers edge cases via adaptive and adversarial testing, and proposes iterative system-prompt rewrites until pass criteria are met.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis** - [Download](https://redis.io/download)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd system-prompt-tool
   ./setup.sh
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

4. **Open the app**: http://localhost:3000

## ✨ Features

### Core Differentiators

- **🎯 System Prompt Copilot**: Automatically synthesize realistic user journeys, constraints, and adversarial probes
- **🔄 Multi-LLM Conformance**: Normalize behavior across Anthropic/OpenAI/Gemini/Llama with model-specific adapters  
- **📊 Coverage-First Testing**: Maximize defect discovery per token with adaptive exploration
- **🛡️ Security-Grade Guardrails**: Red-teaming and fuzzing with adaptive attacks
- **🔧 Auto-Repair**: LLM-written suggestions with explainable diffs and rationale

### Supported Providers

- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude-3 Opus, Claude-3 Sonnet, Claude-3 Haiku  
- **Google**: Gemini Pro
- **Azure OpenAI**: All OpenAI models
- **AWS Bedrock**: Claude models
- **Ollama**: Local models

## 🖥️ CLI Usage

```bash
# Install CLI globally
npm install -g @system-prompt-tool/cli

# Initialize project
spt init

# Generate scenarios
spt generate-scenarios --prompt ./prompts/system.txt

# Run evaluation  
spt run-eval --project-id "proj_123"

# Security scan
spt run-redteam --project-id "proj_123"

# Check CI gates
spt check-gates --project-id "proj_123" --exit-on-fail
```

## 🔄 CI/CD Integration

Ready-to-use GitHub Actions workflows in `examples/ci/`:

- **`run-evals.yml`**: Check thresholds, upload artifacts, fail PR if gates break
- **`nightly-redteam.yml`**: Run adaptive red-team with token budget cap

## 🏗️ Architecture

### Monorepo Structure

```
system-prompt-tool/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Express API server  
├── packages/
│   ├── database/            # Prisma schema
│   ├── shared/              # Shared types
│   ├── providers/           # LLM providers
│   ├── workers/             # Background jobs
│   └── cli/                 # Command-line interface
└── examples/
    └── ci/                  # CI/CD templates
```

### Technology Stack

- **Frontend**: Next.js 14, React Server Components, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, TypeScript, Express, Prisma ORM
- **Database**: PostgreSQL
- **Queue**: BullMQ + Redis
- **Auth**: NextAuth.js
- **Build**: Turborepo

## 📚 Documentation

- **[Full Documentation](./docs/README.md)** - Comprehensive setup and usage guide
- **[API Reference](./docs/api.md)** - REST API documentation  
- **[CLI Reference](./docs/cli.md)** - Command-line interface guide
- **[Deployment Guide](./docs/deployment.md)** - Production deployment

## 🎯 Demo Workflow

1. **Create project** → Add system prompt
2. **Generate scenarios** → Auto-create test cases
3. **Run evaluation** → Test across multiple LLMs
4. **View results** → Pass/fail rates, coverage metrics
5. **Security scan** → Red-team testing
6. **Auto-repair** → LLM-suggested improvements
7. **CI/CD gates** → Automated quality checks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test: `npm run test`
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built for the AI engineering community** 🚀
