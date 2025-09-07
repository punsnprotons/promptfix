import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'

interface CheckGatesOptions {
  projectId: string
  exitOnFail: boolean
}

export async function checkGatesCommand(options: CheckGatesOptions) {
  const spinner = ora('Checking threshold gates...').start()

  try {
    spinner.text = 'Loading threshold configuration...'

    // Mock loading thresholds - in real app this would load from database
    const thresholds = {
      minPassRate: 0.8,
      maxBypassRate: 0.1,
      maxCostDrift: 0.5
    }

    spinner.text = 'Loading latest evaluation results...'

    // Mock evaluation results - in real app this would load from database
    const latestResults = {
      passRate: 0.75,
      bypassRate: 0.15,
      costDrift: 0.3,
      timestamp: new Date().toISOString()
    }

    spinner.text = 'Evaluating gate conditions...'

    const gateResults = {
      passRateGate: {
        threshold: thresholds.minPassRate,
        actual: latestResults.passRate,
        passed: latestResults.passRate >= thresholds.minPassRate,
        message: `Pass rate: ${(latestResults.passRate * 100).toFixed(1)}% (threshold: ${(thresholds.minPassRate * 100).toFixed(1)}%)`
      },
      bypassRateGate: {
        threshold: thresholds.maxBypassRate,
        actual: latestResults.bypassRate,
        passed: latestResults.bypassRate <= thresholds.maxBypassRate,
        message: `Bypass rate: ${(latestResults.bypassRate * 100).toFixed(1)}% (threshold: ${(thresholds.maxBypassRate * 100).toFixed(1)}%)`
      },
      costDriftGate: {
        threshold: thresholds.maxCostDrift,
        actual: latestResults.costDrift,
        passed: latestResults.costDrift <= thresholds.maxCostDrift,
        message: `Cost drift: $${latestResults.costDrift.toFixed(2)} (threshold: $${thresholds.maxCostDrift.toFixed(2)})`
      }
    }

    const allGatesPassed = Object.values(gateResults).every(gate => gate.passed)

    if (allGatesPassed) {
      spinner.succeed('All threshold gates passed!')
      console.log(chalk.green('\n✅ All threshold gates passed!'))
    } else {
      spinner.fail('Some threshold gates failed!')
      console.log(chalk.red('\n❌ Some threshold gates failed!'))
    }

    console.log(chalk.blue('\nGate Results:'))
    
    Object.entries(gateResults).forEach(([gateName, result]) => {
      const status = result.passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')
      const color = result.passed ? chalk.white : chalk.red
      console.log(color(`  ${gateName}: ${status}`))
      console.log(color(`    ${result.message}`))
    })

    console.log(chalk.blue('\nSummary:'))
    console.log(chalk.white(`  Total gates: ${Object.keys(gateResults).length}`))
    console.log(chalk.white(`  Passed: ${Object.values(gateResults).filter(g => g.passed).length}`))
    console.log(chalk.white(`  Failed: ${Object.values(gateResults).filter(g => !g.passed).length}`))

    if (!allGatesPassed) {
      console.log(chalk.yellow('\n⚠️  Recommendations:'))
      
      if (!gateResults.passRateGate.passed) {
        console.log(chalk.white('  - Review failing scenarios and improve prompt'))
        console.log(chalk.white('  - Consider adjusting evaluation criteria'))
      }
      
      if (!gateResults.bypassRateGate.passed) {
        console.log(chalk.white('  - Strengthen security measures in prompt'))
        console.log(chalk.white('  - Implement additional input validation'))
      }
      
      if (!gateResults.costDriftGate.passed) {
        console.log(chalk.white('  - Optimize prompt for token efficiency'))
        console.log(chalk.white('  - Consider using more cost-effective models'))
      }

      if (options.exitOnFail) {
        console.log(chalk.red('\nExiting with non-zero code due to failed gates'))
        process.exit(1)
      }
    }

  } catch (error) {
    spinner.fail('Failed to check gates')
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}
