# System Prompt Analysis & Auto-Repair Tool

A production-ready web application that ingests system prompts, auto-generates user interaction scenarios, runs evaluations across selected LLMs, discovers edge cases via adaptive and adversarial testing, and proposes iterative system-prompt rewrites until pass criteria are met.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis** - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/downloads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd system-prompt-tool
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

3. **Configure environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   - Web App: http://localhost:3000
   - API: http://localhost:3001

## 📋 Features

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

## 🏗️ Architecture

### Monorepo Structure

```
system-prompt-tool/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── api/                 # Express API server
├── packages/
│   ├── database/            # Prisma schema and migrations
│   ├── shared/              # Shared types and utilities
│   ├── providers/           # LLM provider implementations
│   ├── workers/             # Background job workers
│   └── cli/                 # Command-line interface
├── examples/
│   └── ci/                  # CI/CD templates
└── docs/                    # Documentation
```

### Technology Stack

- **Frontend**: Next.js 14, React Server Components, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, TypeScript, Express, Prisma ORM
- **Database**: PostgreSQL
- **Queue**: BullMQ + Redis
- **Auth**: NextAuth.js
- **State Management**: Zustand, React Query
- **Build System**: Turborepo

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start all development servers
npm run build            # Build all packages
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm run clean            # Clean build artifacts

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio

# Individual packages
cd packages/shared && npm run build
cd packages/providers && npm run build
cd packages/cli && npm run build
cd apps/web && npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/system_prompt_tool"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# LLM Provider API Keys
OPENAI_API_KEY="sk-your-openai-api-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
GOOGLE_API_KEY="your-google-api-key"

# Redis
REDIS_URL="redis://localhost:6379"

# Optional: Email and OAuth
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🖥️ CLI Usage

The System Prompt Tool includes a comprehensive CLI for local development and CI/CD integration.

### Installation

```bash
npm install -g @system-prompt-tool/cli
```

### Commands

#### Initialize Project

```bash
spt init
spt init --directory ./my-project
spt init --skip-install
```

#### Generate Scenarios

```bash
spt generate-scenarios --prompt ./prompts/system.txt
spt generate-scenarios --prompt ./prompts/system.txt --count 20 --types "user_intent,adversarial"
spt generate-scenarios --prompt ./prompts/system.txt --output ./scenarios
```

#### Run Evaluation

```bash
spt run-eval --project-id "proj_123"
spt run-eval --suite-id "suite_456" --providers "openai:gpt-4,anthropic:claude-3-sonnet"
spt run-eval --config ./eval-config.json
```

#### Security Scanning

```bash
spt run-redteam --project-id "proj_123"
spt run-redteam --suite-id "suite_456" --attacks "jailbreak,prompt_injection,data_exfiltration"
```

#### Export Reports

```bash
spt export-report --run-id "run_789" --format json
spt export-report --run-id "run_789" --format markdown --output ./reports/
```

#### CI/CD Thresholds

```bash
spt set-thresholds --project-id "proj_123" --min-pass-rate 0.8 --max-bypass-rate 0.1
spt check-gates --project-id "proj_123" --exit-on-fail
```

## 🔄 CI/CD Integration

### GitHub Actions

The tool includes ready-to-use GitHub Actions workflows:

#### Evaluation Workflow

```yaml
# .github/workflows/evaluate.yml
name: Run Evaluations
on: [push, pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm install -g @system-prompt-tool/cli
      - run: spt generate-scenarios --prompt ./prompts/system.txt
      - run: spt run-eval --project-id ${{ secrets.PROJECT_ID }}
      - run: spt check-gates --project-id ${{ secrets.PROJECT_ID }} --exit-on-fail
```

#### Security Scanning

```yaml
# .github/workflows/security.yml
name: Nightly Security Scan
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm install -g @system-prompt-tool/cli
      - run: spt run-redteam --project-id ${{ secrets.PROJECT_ID }}
```

### Required Secrets

Add these secrets to your GitHub repository:

- `PROJECT_ID`: Your project identifier
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `GOOGLE_API_KEY`: Google API key (optional)

## 📊 API Reference

### Authentication

The API uses NextAuth.js for authentication. Include the session token in requests:

```bash
curl -H "Authorization: Bearer <session-token>" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/projects
```

### Endpoints

#### Projects

```bash
GET    /api/projects                    # List projects
POST   /api/projects                    # Create project
GET    /api/projects/:id                # Get project details
PUT    /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project
```

#### Prompt Versions

```bash
GET    /api/prompt-versions             # List prompt versions
POST   /api/prompt-versions             # Create prompt version
GET    /api/prompt-versions/:id         # Get prompt version
PUT    /api/prompt-versions/:id         # Update prompt version
DELETE /api/prompt-versions/:id         # Delete prompt version
```

#### Evaluations

```bash
POST   /api/evaluations                 # Start evaluation
GET    /api/evaluations/:id             # Get evaluation status
GET    /api/evaluations/:id/results     # Get evaluation results
```

#### Security

```bash
POST   /api/security/redteam             # Start red-team scan
GET    /api/security/redteam/:id        # Get scan results
```

## 🧪 Testing

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests (when implemented)
npm run test

# Integration tests (when implemented)
npm run test:integration
```

### Test Data

The database is seeded with demo data including:

- Demo organization and user
- Sample project with customer support prompt
- Generated scenarios (user intents, adversarial, constraints)
- Mock evaluation results
- Coverage metrics

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Setup

1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure environment variables
4. Run database migrations:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

### Project Structure Guidelines

- Keep shared logic in `packages/shared`
- Provider-specific code in `packages/providers`
- Database operations in `packages/database`
- UI components in `apps/web/components`
- API routes in `apps/web/app/api`

## 📚 Documentation

### Additional Resources

- [API Documentation](./docs/api.md)
- [CLI Reference](./docs/cli.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./docs/contributing.md)
- [Architecture Overview](./docs/architecture.md)

### Examples

- [Basic Usage](./examples/basic-usage.md)
- [Advanced Scenarios](./examples/advanced-scenarios.md)
- [CI/CD Integration](./examples/ci-integration.md)
- [Custom Providers](./examples/custom-providers.md)

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check PostgreSQL status
pg_isready

# Check database exists
psql -l | grep system_prompt_tool

# Reset database
npm run db:push --force-reset
```

#### Redis Connection Issues

```bash
# Check Redis status
redis-cli ping

# Check Redis configuration
redis-cli config get "*"
```

#### Provider API Issues

- Verify API keys are correctly set in `.env.local`
- Check API key permissions and quotas
- Review provider-specific rate limits

#### Build Issues

```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript errors
npm run type-check
```

### Getting Help

- Check the [Issues](https://github.com/your-org/system-prompt-tool/issues) page
- Review the [Discussions](https://github.com/your-org/system-prompt-tool/discussions) forum
- Join our [Discord community](https://discord.gg/your-invite)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://prisma.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Inspired by [Helicone](https://helicone.ai/) and [Promptfoo](https://promptfoo.dev/)

---

**Built for the AI engineering community** 🚀
