# PromptFix 🚀

**AI-powered prompt analysis, testing, and optimization platform for better LLM performance.**

PromptFix is a production-ready web application that helps you analyze, test, and optimize your AI prompts across multiple LLM providers. It automatically generates test scenarios, runs comprehensive evaluations, performs security scans, and provides AI-powered suggestions to improve your prompts.

![PromptFix Banner](https://img.shields.io/badge/PromptFix-AI%20Platform-orange?style=for-the-badge)

## ✨ Features

### 🎯 **Auto Pipeline Mode**
- **One-click optimization**: Automatically runs your prompt through all analysis stages
- **Real-time progress**: See results as each step completes
- **Smart recommendations**: Get AI-powered suggestions for improvement

### 🧪 **Scenario Generation**
- **Diverse test cases**: Automatically generate user intent, constraint, adversarial, and edge case scenarios
- **Coverage metrics**: Ensure comprehensive testing across different use cases
- **Adaptive exploration**: Smart scenario discovery for maximum defect detection

### 📊 **Multi-LLM Evaluation**
- **Provider support**: OpenAI, Anthropic, Groq, and more
- **LLM-as-judge**: Automated quality assessment
- **Performance metrics**: Response time, token usage, and cost tracking
- **Comparative analysis**: Side-by-side provider comparison

### 🛡️ **Security Scanning**
- **Red-team testing**: Automated security vulnerability detection
- **Attack vectors**: Prompt injection, data exfiltration, jailbreak attempts
- **Compliance**: OWASP and NIST-style security mappings
- **Risk assessment**: Detailed vulnerability reports

### 🔧 **Prompt Repair**
- **AI-powered analysis**: Intelligent prompt improvement suggestions
- **Explainable diffs**: Clear before/after comparisons with rationale
- **Focus areas**: Clarity, safety, performance, consistency optimization
- **Version control**: Track prompt iterations and improvements

### 🎛️ **Model Adapters**
- **Provider optimization**: Create model-specific prompt variations
- **Migration support**: Seamless switching between LLM providers
- **Regression testing**: Ensure consistent behavior across models
- **Performance tuning**: Provider-specific optimizations

### 💾 **Real Database Integration**
- **Supabase backend**: Production-ready PostgreSQL database
- **Real-time data**: Live project management and results storage
- **Row-level security**: Secure multi-user data isolation
- **Scalable architecture**: Built for production workloads

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- API keys for your preferred LLM providers

### 1. Clone and Install
```bash
git clone https://github.com/punsnprotons/system-prompt-analysis-app.git
cd system-prompt-analysis-app
npm install
```

### 2. Set Up Supabase Database
1. Go to [Supabase](https://supabase.com) and create a new project
2. In the Supabase SQL Editor, run the schema from `supabase-schema.sql`
3. Copy your project URL and API keys from Settings > API

### 3. Configure Environment Variables
```bash
cd apps/web
cp env.local .env.local
```

Edit `.env.local` with your actual credentials:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# LLM Provider APIs
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# NextAuth (generate a random secret)
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to start using PromptFix!

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: NextAuth.js (ready for implementation)
- **LLM Integration**: OpenAI, Anthropic, Groq SDKs
- **State Management**: React Query for server state

### Database Schema
- **projects**: Core project management
- **evaluation_runs**: LLM evaluation results and metrics
- **scenario_suites**: Generated test scenario collections
- **prompt_versions**: Version control for prompt iterations
- **security_scans**: Security vulnerability scan results
- **model_adapters**: Provider-specific optimizations

## 🎯 Usage Guide

### Creating Your First Project
1. **Homepage**: Enter your system prompt or use a random example
2. **Auto Pipeline**: Click "Start Auto Pipeline Analysis" for automated optimization
3. **Manual Mode**: Use individual tools (Scenarios, Evaluation, Security, Repair)

### Auto Pipeline Workflow
1. **Scenario Generation**: Creates diverse test cases
2. **LLM Evaluation**: Tests across multiple providers
3. **Security Scanning**: Checks for vulnerabilities
4. **Prompt Repair**: AI-powered improvement suggestions
5. **Model Adaptation**: Provider-specific optimizations

### Managing Projects
- **Dashboard**: View all projects and their status
- **Project Details**: Drill down into specific results
- **Version History**: Track prompt improvements over time
- **Export/Import**: Share configurations and results

## 🔧 Configuration

### LLM Providers
Configure your preferred providers in the environment variables:
- **Groq**: Fast inference with Llama models
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude models

### Security Settings
- Row Level Security (RLS) enabled by default
- API key validation and rate limiting
- Secure credential storage in environment variables

### Performance Tuning
- Database indexes for optimal query performance
- Connection pooling via Supabase
- Efficient API design with minimal round trips

## 🛡️ Security Features

### Red Team Testing
- **Prompt Injection**: Tests for malicious input handling
- **Data Exfiltration**: Checks for information leakage
- **Jailbreak Attempts**: Validates safety guardrails
- **Role Confusion**: Tests for unauthorized behavior

### Compliance
- OWASP AI Security guidelines
- NIST AI Risk Management Framework
- Privacy-preserving design patterns

## 📈 Monitoring & Analytics

### Built-in Metrics
- **Performance**: Response times, token usage, costs
- **Quality**: LLM-as-judge scores, consistency metrics
- **Security**: Vulnerability counts, risk assessments
- **Usage**: API call tracking, provider utilization

### Export Options
- JSON/CSV data export
- Detailed PDF reports
- API integration for external tools

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](../../wiki) for detailed guides
- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)
- **Discussions**: Join our [GitHub Discussions](../../discussions) for community support

## 🚧 Roadmap

### Upcoming Features
- [ ] **Authentication**: Complete NextAuth.js integration
- [ ] **Team Collaboration**: Multi-user project sharing
- [ ] **CI/CD Integration**: GitHub Actions, GitLab CI
- [ ] **Advanced Analytics**: Custom metrics and dashboards
- [ ] **API Endpoints**: REST API for external integrations
- [ ] **Prompt Templates**: Pre-built prompt libraries
- [ ] **A/B Testing**: Automated prompt variant testing

### Provider Integrations
- [ ] **Google AI**: Gemini models
- [ ] **AWS Bedrock**: Claude, Titan, Jurassic
- [ ] **Azure OpenAI**: Enterprise-grade OpenAI
- [ ] **Ollama**: Local model support
- [ ] **Hugging Face**: Open source models

---

**Built with ❤️ for the AI engineering community**

*PromptFix helps you build more reliable, secure, and performant AI applications through comprehensive prompt analysis and optimization.*