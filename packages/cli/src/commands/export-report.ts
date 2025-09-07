import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'

interface ExportReportOptions {
  runId: string
  format: string
  output: string
}

export async function exportReportCommand(options: ExportReportOptions) {
  const spinner = ora('Exporting report...').start()

  try {
    spinner.text = 'Loading evaluation data...'
    
    // Mock data loading - in real app this would load from database
    const reportData = await loadReportData(options.runId)
    
    if (!reportData) {
      spinner.fail('Report not found')
      process.exit(1)
    }
    
    spinner.text = `Generating ${options.format} report...`
    
    let outputContent: string
    let fileExtension: string
    
    switch (options.format.toLowerCase()) {
      case 'json':
        outputContent = JSON.stringify(reportData, null, 2)
        fileExtension = 'json'
        break
        
      case 'markdown':
        outputContent = generateMarkdownReport(reportData)
        fileExtension = 'md'
        break
        
      case 'pdf':
        // For PDF generation, we'd use a library like puppeteer or jsPDF
        spinner.fail('PDF export not implemented yet')
        console.log(chalk.yellow('Please use JSON or Markdown format for now'))
        process.exit(1)
        
      default:
        spinner.fail(`Unsupported format: ${options.format}`)
        console.log(chalk.yellow('Supported formats: json, markdown'))
        process.exit(1)
    }
    
    // Determine output file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputFile = options.output || `report-${options.runId}-${timestamp}.${fileExtension}`
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputFile)
    if (outputDir !== '.') {
      await fs.ensureDir(outputDir)
    }
    
    // Write file
    await fs.writeFile(outputFile, outputContent)
    
    spinner.succeed('Report exported successfully!')
    
    console.log(chalk.green('\n✅ Report exported successfully!'))
    console.log(chalk.blue(`\nFile: ${outputFile}`))
    console.log(chalk.white(`Format: ${options.format.toUpperCase()}`))
    console.log(chalk.white(`Size: ${(outputContent.length / 1024).toFixed(1)} KB`))
    
  } catch (error) {
    spinner.fail('Export failed')
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}

async function loadReportData(runId: string) {
  // Mock implementation - in real app this would load from database
  return {
    metadata: {
      runId,
      timestamp: new Date().toISOString(),
      projectId: 'demo-project',
      suiteId: 'demo-suite',
      providers: [
        { provider: 'openai', model: 'gpt-4' },
        { provider: 'anthropic', model: 'claude-3-sonnet' }
      ],
      totalScenarios: 2,
      totalRuns: 4
    },
    summary: {
      totalRuns: 4,
      passedRuns: 3,
      passRate: 0.75,
      byProvider: {
        'openai:gpt-4': {
          totalRuns: 2,
          passedRuns: 2,
          passRate: 1.0,
          totalCost: 0.05,
          totalTokens: 500
        },
        'anthropic:claude-3-sonnet': {
          totalRuns: 2,
          passedRuns: 1,
          passRate: 0.5,
          totalCost: 0.04,
          totalTokens: 400
        }
      }
    },
    results: [
      {
        scenarioId: 'scenario-1',
        provider: 'openai',
        model: 'gpt-4',
        output: 'I\'d be happy to help you check the status of order #12345...',
        scores: {
          overall: 0.95,
          instruction_adherence: 0.9,
          tone: 0.95,
          security: 1.0
        },
        pass: true,
        latencyMs: 1200,
        cost: 0.025,
        tokens: 250
      },
      {
        scenarioId: 'scenario-1',
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        output: 'I can help you check the status of order #12345...',
        scores: {
          overall: 0.92,
          instruction_adherence: 0.88,
          tone: 0.95,
          security: 1.0
        },
        pass: true,
        latencyMs: 1100,
        cost: 0.02,
        tokens: 200
      }
    ],
    costStats: {
      totalCost: 0.09,
      totalTokens: 900,
      averageCostPerRun: 0.0225,
      averageTokensPerRun: 225
    }
  }
}

function generateMarkdownReport(data: any): string {
  const { metadata, summary, results, costStats } = data
  
  let markdown = `# Evaluation Report\n\n`
  
  // Metadata
  markdown += `## Metadata\n\n`
  markdown += `- **Run ID**: ${metadata.runId}\n`
  markdown += `- **Timestamp**: ${metadata.timestamp}\n`
  markdown += `- **Project ID**: ${metadata.projectId}\n`
  markdown += `- **Suite ID**: ${metadata.suiteId}\n`
  markdown += `- **Total Scenarios**: ${metadata.totalScenarios}\n`
  markdown += `- **Total Runs**: ${metadata.totalRuns}\n\n`
  
  // Summary
  markdown += `## Summary\n\n`
  markdown += `- **Overall Pass Rate**: ${(summary.passRate * 100).toFixed(1)}%\n`
  markdown += `- **Total Cost**: $${costStats.totalCost.toFixed(4)}\n`
  markdown += `- **Total Tokens**: ${costStats.totalTokens.toLocaleString()}\n\n`
  
  // Provider breakdown
  markdown += `## Provider Performance\n\n`
  markdown += `| Provider | Pass Rate | Cost | Tokens |\n`
  markdown += `|----------|-----------|------|--------|\n`
  
  for (const [provider, stats] of Object.entries(summary.byProvider)) {
    markdown += `| ${provider} | ${(stats.passRate * 100).toFixed(1)}% | $${stats.totalCost.toFixed(4)} | ${stats.totalTokens} |\n`
  }
  
  markdown += `\n`
  
  // Detailed results
  markdown += `## Detailed Results\n\n`
  
  for (const result of results) {
    markdown += `### ${result.scenarioId} - ${result.provider}:${result.model}\n\n`
    markdown += `**Status**: ${result.pass ? '✅ PASS' : '❌ FAIL'}\n\n`
    markdown += `**Scores**:\n`
    markdown += `- Overall: ${(result.scores.overall * 100).toFixed(1)}%\n`
    markdown += `- Instruction Adherence: ${(result.scores.instruction_adherence * 100).toFixed(1)}%\n`
    markdown += `- Tone: ${(result.scores.tone * 100).toFixed(1)}%\n`
    markdown += `- Security: ${(result.scores.security * 100).toFixed(1)}%\n\n`
    markdown += `**Performance**:\n`
    markdown += `- Latency: ${result.latencyMs}ms\n`
    markdown += `- Cost: $${result.cost.toFixed(4)}\n`
    markdown += `- Tokens: ${result.tokens}\n\n`
    markdown += `**Output**:\n`
    markdown += `\`\`\`\n${result.output}\n\`\`\`\n\n`
  }
  
  return markdown
}
