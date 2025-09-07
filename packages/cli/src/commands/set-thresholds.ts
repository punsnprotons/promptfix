import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'

interface SetThresholdsOptions {
  projectId: string
  minPassRate: string
  maxBypassRate: string
  maxCostDrift: string
}

export async function setThresholdsCommand(options: SetThresholdsOptions) {
  const spinner = ora('Setting threshold gates...').start()

  try {
    const thresholds = {
      minPassRate: parseFloat(options.minPassRate),
      maxBypassRate: parseFloat(options.maxBypassRate),
      maxCostDrift: parseFloat(options.maxCostDrift)
    }

    // Validate thresholds
    if (thresholds.minPassRate < 0 || thresholds.minPassRate > 1) {
      spinner.fail('Minimum pass rate must be between 0 and 1')
      process.exit(1)
    }

    if (thresholds.maxBypassRate < 0 || thresholds.maxBypassRate > 1) {
      spinner.fail('Maximum bypass rate must be between 0 and 1')
      process.exit(1)
    }

    if (thresholds.maxCostDrift < 0) {
      spinner.fail('Maximum cost drift must be positive')
      process.exit(1)
    }

    spinner.text = 'Saving threshold configuration...'

    // Mock saving - in real app this would save to database
    const config = {
      projectId: options.projectId,
      thresholds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    spinner.succeed('Threshold gates configured successfully!')

    console.log(chalk.green('\n✅ Threshold gates configured!'))
    console.log(chalk.blue('\nConfiguration:'))
    console.log(chalk.white(`  Minimum pass rate: ${(thresholds.minPassRate * 100).toFixed(1)}%`))
    console.log(chalk.white(`  Maximum bypass rate: ${(thresholds.maxBypassRate * 100).toFixed(1)}%`))
    console.log(chalk.white(`  Maximum cost drift: $${thresholds.maxCostDrift.toFixed(2)}`))

    console.log(chalk.blue('\nNext steps:'))
    console.log(chalk.white('1. Run evaluation: spt run-eval'))
    console.log(chalk.white('2. Check gates: spt check-gates'))
    console.log(chalk.white('3. Use in CI/CD pipeline'))

  } catch (error) {
    spinner.fail('Failed to set thresholds')
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}
