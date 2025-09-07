import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

interface InitOptions {
  directory: string
  skipInstall: boolean
}

export async function initCommand(options: InitOptions) {
  const spinner = ora('Initializing project...').start()

  try {
    const projectDir = path.resolve(options.directory)
    
    // Check if directory exists and is empty
    if (await fs.pathExists(projectDir)) {
      const files = await fs.readdir(projectDir)
      if (files.length > 0) {
        spinner.fail('Directory is not empty')
        console.log(chalk.yellow('Please choose an empty directory or use --directory to specify a different path'))
        process.exit(1)
      }
    } else {
      await fs.ensureDir(projectDir)
    }

    // Interactive setup
    spinner.stop()
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: path.basename(projectDir),
        validate: (input) => input.length > 0 || 'Project name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'System prompt analysis project'
      },
      {
        type: 'input',
        name: 'systemPrompt',
        message: 'System prompt (or path to file):',
        validate: (input) => input.length > 0 || 'System prompt is required'
      }
    ])

    spinner.start('Creating project files...')

    // Create package.json
    const packageJson = {
      name: answers.projectName,
      version: '1.0.0',
      description: answers.description,
      private: true,
      scripts: {
        'generate-scenarios': 'spt generate-scenarios --prompt ./prompts/system.txt',
        'run-eval': 'spt run-eval --project-id ${PROJECT_ID}',
        'run-redteam': 'spt run-redteam --project-id ${PROJECT_ID}',
        'check-gates': 'spt check-gates --project-id ${PROJECT_ID} --exit-on-fail'
      },
      devDependencies: {
        '@system-prompt-tool/cli': '^1.0.0'
      }
    }

    await fs.writeJson(path.join(projectDir, 'package.json'), packageJson, { spaces: 2 })

    // Create prompts directory and system prompt
    const promptsDir = path.join(projectDir, 'prompts')
    await fs.ensureDir(promptsDir)

    let systemPromptContent = answers.systemPrompt
    if (await fs.pathExists(answers.systemPrompt)) {
      systemPromptContent = await fs.readFile(answers.systemPrompt, 'utf-8')
    }

    await fs.writeFile(
      path.join(promptsDir, 'system.txt'),
      systemPromptContent
    )

    // Create scenarios directory
    await fs.ensureDir(path.join(projectDir, 'scenarios'))

    // Create config directory
    await fs.ensureDir(path.join(projectDir, 'config'))

    // Create .env.example
    const envExample = `# System Prompt Tool Configuration
PROJECT_ID=your-project-id
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
GOOGLE_API_KEY=your-google-api-key

# Optional: Database connection for advanced features
DATABASE_URL=postgresql://username:password@localhost:5432/system_prompt_tool
`

    await fs.writeFile(path.join(projectDir, '.env.example'), envExample)

    // Create README.md
    const readme = `# ${answers.projectName}

${answers.description}

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys and project ID
   \`\`\`

3. Generate test scenarios:
   \`\`\`bash
   npm run generate-scenarios
   \`\`\`

4. Run evaluation:
   \`\`\`bash
   npm run run-eval
   \`\`\`

5. Run security scan:
   \`\`\`bash
   npm run run-redteam
   \`\`\`

## Project Structure

- \`prompts/\` - System prompts and prompt versions
- \`scenarios/\` - Generated test scenarios
- \`config/\` - Configuration files
- \`.env\` - Environment variables (not committed)

## CLI Commands

- \`spt generate-scenarios\` - Generate test scenarios
- \`spt run-eval\` - Run evaluation across LLMs
- \`spt run-redteam\` - Run security scan
- \`spt export-report\` - Export evaluation results
- \`spt check-gates\` - Check CI/CD thresholds
`

    await fs.writeFile(path.join(projectDir, 'README.md'), readme)

    // Create .gitignore
    const gitignore = `node_modules/
.env
.env.local
dist/
*.log
.DS_Store
`

    await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore)

    spinner.succeed('Project initialized successfully!')

    console.log(chalk.green('\n✅ Project created successfully!'))
    console.log(chalk.blue('\nNext steps:'))
    console.log(chalk.white('1. cd ' + projectDir))
    console.log(chalk.white('2. npm install'))
    console.log(chalk.white('3. cp .env.example .env'))
    console.log(chalk.white('4. Edit .env with your API keys'))
    console.log(chalk.white('5. npm run generate-scenarios'))

    if (!options.skipInstall) {
      spinner.start('Installing dependencies...')
      try {
        execSync('npm install', { cwd: projectDir, stdio: 'pipe' })
        spinner.succeed('Dependencies installed!')
      } catch (error) {
        spinner.fail('Failed to install dependencies')
        console.log(chalk.yellow('Please run "npm install" manually'))
      }
    }

  } catch (error) {
    spinner.fail('Failed to initialize project')
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}
