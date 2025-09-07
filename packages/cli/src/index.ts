#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { initCommand } from './commands/init'
import { generateScenariosCommand } from './commands/generate-scenarios'
import { runEvalCommand } from './commands/run-eval'
import { runRedteamCommand } from './commands/run-redteam'
import { exportReportCommand } from './commands/export-report'
import { setThresholdsCommand } from './commands/set-thresholds'
import { checkGatesCommand } from './commands/check-gates'

const program = new Command()

program
  .name('spt')
  .description('System Prompt Analysis & Auto-Repair CLI')
  .version('1.0.0')

program
  .command('init')
  .description('Initialize a new project')
  .option('-d, --directory <path>', 'Project directory', '.')
  .option('--skip-install', 'Skip package installation')
  .action(initCommand)

program
  .command('generate-scenarios')
  .description('Generate test scenarios from a system prompt')
  .option('-p, --prompt <path>', 'Path to system prompt file')
  .option('-o, --output <path>', 'Output directory for scenarios')
  .option('-c, --count <number>', 'Number of scenarios to generate', '10')
  .option('-t, --types <types>', 'Comma-separated scenario types', 'user_intent,constraint,adversarial')
  .action(generateScenariosCommand)

program
  .command('run-eval')
  .description('Run evaluation against multiple LLM providers')
  .option('-p, --project-id <id>', 'Project ID')
  .option('-s, --suite-id <id>', 'Scenario suite ID')
  .option('--providers <providers>', 'Comma-separated providers', 'openai:gpt-4,anthropic:claude-3-sonnet')
  .option('--config <path>', 'Path to evaluation config file')
  .action(runEvalCommand)

program
  .command('run-redteam')
  .description('Run red-team security scan')
  .option('-p, --project-id <id>', 'Project ID')
  .option('-s, --suite-id <id>', 'Scenario suite ID')
  .option('--attacks <attacks>', 'Comma-separated attack types', 'jailbreak,prompt_injection,data_exfiltration')
  .action(runRedteamCommand)

program
  .command('export-report')
  .description('Export evaluation report')
  .option('-r, --run-id <id>', 'Evaluation run ID')
  .option('-f, --format <format>', 'Export format', 'json')
  .option('-o, --output <path>', 'Output file path')
  .action(exportReportCommand)

program
  .command('set-thresholds')
  .description('Set CI/CD threshold gates')
  .option('-p, --project-id <id>', 'Project ID')
  .option('--min-pass-rate <rate>', 'Minimum pass rate (0-1)', '0.8')
  .option('--max-bypass-rate <rate>', 'Maximum bypass rate (0-1)', '0.1')
  .option('--max-cost-drift <cost>', 'Maximum cost drift', '0.5')
  .action(setThresholdsCommand)

program
  .command('check-gates')
  .description('Check CI/CD threshold gates')
  .option('-p, --project-id <id>', 'Project ID')
  .option('--exit-on-fail', 'Exit with non-zero code on failure')
  .action(checkGatesCommand)

// Global error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`))
  console.log(chalk.yellow('See --help for available commands'))
  process.exit(1)
})

program.parse()

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error)
  process.exit(1)
})
