import { PromptRepairEngine, ModelAdapterEngine } from '@/lib/prompt-repair-engine'
import { EvaluationEngine } from '@/lib/evaluation-engine'
import { ScenarioGenerator } from '@/lib/scenario-generator'
import { RedTeamEngine } from '@/lib/redteam-engine'

// Auto Pipeline Types
export interface PipelineStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt?: string
  finishedAt?: string
  duration?: number
  results?: any
  error?: string
  cost?: number
  tokens?: number
}

export interface PipelineConfig {
  id: string
  name: string
  description: string
  steps: PipelineStep[]
  originalPrompt: string
  targetProvider?: string
  targetModel?: string
  options: {
    generateScenarios: boolean
    runEvaluation: boolean
    securityScan: boolean
    promptRepair: boolean
    createAdapter: boolean
    scenarioCount: number
    evaluationProviders: string[]
    repairFocusAreas: string[]
    securityAttackTypes: string[]
  }
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  startedAt: string
  finishedAt?: string
  totalCost: number
  totalTokens: number
  summary: {
    totalSteps: number
    completedSteps: number
    failedSteps: number
    skippedSteps: number
    averageScore?: number
    criticalIssues?: number
    suggestions?: number
  }
}

export interface PipelineResult {
  config: PipelineConfig
  finalPrompt?: string
  recommendations: string[]
  nextSteps: string[]
  qualityScore: number
  confidenceLevel: 'low' | 'medium' | 'high'
}

// Auto Pipeline Engine
export class AutoPipelineEngine {
  private repairEngine: PromptRepairEngine
  private adapterEngine: ModelAdapterEngine
  private evaluationEngine: EvaluationEngine
  private scenarioGenerator: ScenarioGenerator
  private redTeamEngine: RedTeamEngine

  constructor() {
    this.repairEngine = new PromptRepairEngine()
    this.adapterEngine = new ModelAdapterEngine()
    this.evaluationEngine = new EvaluationEngine()
    this.scenarioGenerator = new ScenarioGenerator()
    this.redTeamEngine = new RedTeamEngine()
  }

  async runAutoPipeline(
    originalPrompt: string,
    options: {
      targetProvider?: string
      targetModel?: string
      generateScenarios?: boolean
      runEvaluation?: boolean
      securityScan?: boolean
      promptRepair?: boolean
      createAdapter?: boolean
      scenarioCount?: number
      evaluationProviders?: string[]
      repairFocusAreas?: string[]
      securityAttackTypes?: string[]
    } = {}
  ): Promise<PipelineResult> {
    const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const config: PipelineConfig = {
      id: pipelineId,
      name: 'Auto Pipeline Analysis',
      description: 'Comprehensive analysis and optimization of system prompt',
      steps: [],
      originalPrompt,
      targetProvider: options.targetProvider,
      targetModel: options.targetModel,
      options: {
        generateScenarios: options.generateScenarios ?? true,
        runEvaluation: options.runEvaluation ?? true,
        securityScan: options.securityScan ?? true,
        promptRepair: options.promptRepair ?? true,
        createAdapter: options.createAdapter ?? true,
        scenarioCount: options.scenarioCount ?? 10,
        evaluationProviders: options.evaluationProviders ?? ['groq'],
        repairFocusAreas: options.repairFocusAreas ?? ['clarity', 'safety', 'performance'],
        securityAttackTypes: options.securityAttackTypes ?? ['prompt_injection', 'data_exfiltration']
      },
      status: 'running',
      startedAt: new Date().toISOString(),
      totalCost: 0,
      totalTokens: 0,
      summary: {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0
      }
    }

    // Define pipeline steps
    const steps: PipelineStep[] = [
      {
        id: 'scenario_generation',
        name: 'Scenario Generation',
        description: 'Generate diverse test scenarios for comprehensive coverage',
        status: 'pending'
      },
      {
        id: 'evaluation',
        name: 'LLM Evaluation',
        description: 'Test prompt across multiple LLM providers',
        status: 'pending'
      },
      {
        id: 'security_scan',
        name: 'Security Scan',
        description: 'Red-team testing for vulnerabilities',
        status: 'pending'
      },
      {
        id: 'prompt_repair',
        name: 'Prompt Repair',
        description: 'AI-powered analysis and improvement suggestions',
        status: 'pending'
      },
      {
        id: 'model_adapter',
        name: 'Model Adapter',
        description: 'Create provider-specific optimizations',
        status: 'pending'
      }
    ]

    config.steps = steps
    config.summary.totalSteps = steps.length

    let currentPrompt = originalPrompt
    const recommendations: string[] = []
    const nextSteps: string[] = []

    try {
      // Step 1: Scenario Generation
      if (config.options.generateScenarios) {
        const step = config.steps.find(s => s.id === 'scenario_generation')!
        step.status = 'running'
        step.startedAt = new Date().toISOString()

        try {
          const scenarios = await this.scenarioGenerator.generateScenarios(currentPrompt, {
            count: config.options.scenarioCount,
            types: ['user_intent', 'constraint', 'adversarial', 'edge_case'],
            includeAdversarial: true,
            diversityBoost: true
          })

          step.results = scenarios
          step.status = 'completed'
          step.finishedAt = new Date().toISOString()
          step.duration = new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()
          step.cost = 0.001 // Estimated cost for scenario generation
          step.tokens = scenarios.length * 50 // Estimated tokens
          config.totalCost += step.cost
          config.totalTokens += step.tokens
          config.summary.completedSteps++

          recommendations.push(`Generated ${scenarios.length} diverse test scenarios`)
        } catch (error) {
          step.status = 'failed'
          step.error = error instanceof Error ? error.message : 'Unknown error'
          step.finishedAt = new Date().toISOString()
          config.summary.failedSteps++
        }
      } else {
        const step = config.steps.find(s => s.id === 'scenario_generation')!
        step.status = 'skipped'
        config.summary.skippedSteps++
      }

      // Step 2: Evaluation
      if (config.options.runEvaluation) {
        const step = config.steps.find(s => s.id === 'evaluation')!
        step.status = 'running'
        step.startedAt = new Date().toISOString()

        try {
          const evaluation = await this.evaluationEngine.runEvaluation({
            systemPrompt: currentPrompt,
            userMessage: 'Test the system prompt with a typical user request',
            providers: config.options.evaluationProviders.map(provider => ({
              name: provider,
              model: provider === 'groq' ? 'llama-3.1-8b-instant' : 
                     provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet',
              apiKey: 'configured'
            }))
          })

          step.results = evaluation
          step.status = 'completed'
          step.finishedAt = new Date().toISOString()
          step.duration = new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()
          step.cost = evaluation.summary?.totalCost || 0.005 // Fallback cost
          step.tokens = evaluation.results?.reduce((sum, r) => sum + (r.tokens?.total || 0), 0) || 300 // Fallback tokens
          config.totalCost += step.cost
          config.totalTokens += step.tokens
          config.summary.completedSteps++

          const avgScore = evaluation.summary?.averageScore
          config.summary.averageScore = avgScore

          if (avgScore && avgScore < 7) {
            recommendations.push(`Evaluation score ${avgScore.toFixed(1)}/10 - prompt needs improvement`)
          } else if (avgScore) {
            recommendations.push(`Evaluation score ${avgScore.toFixed(1)}/10 - prompt performing well`)
          }
        } catch (error) {
          step.status = 'failed'
          step.error = error instanceof Error ? error.message : 'Unknown error'
          step.finishedAt = new Date().toISOString()
          config.summary.failedSteps++
        }
      } else {
        const step = config.steps.find(s => s.id === 'evaluation')!
        step.status = 'skipped'
        config.summary.skippedSteps++
      }

      // Step 3: Security Scan
      if (config.options.securityScan) {
        const step = config.steps.find(s => s.id === 'security_scan')!
        step.status = 'running'
        step.startedAt = new Date().toISOString()

        try {
          const securityScan = await this.redTeamEngine.runRedTeamScan(currentPrompt, {
            attackTypes: config.options.securityAttackTypes as any[],
            policyPacks: ['basic_safety', 'data_protection'],
            maxCost: 1.0,
            adaptiveMode: true
          })

          step.results = securityScan
          step.status = 'completed'
          step.finishedAt = new Date().toISOString()
          step.duration = new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()
          step.cost = securityScan.summary?.totalCost || 0.002 // Fallback cost
          step.tokens = securityScan.vulnerabilities?.reduce((sum, v) => sum + (v.tokensUsed || 0), 0) || 100 // Fallback tokens
          config.totalCost += step.cost
          config.totalTokens += step.tokens
          config.summary.completedSteps++

          const criticalVulns = securityScan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0
          config.summary.criticalIssues = criticalVulns

          if (criticalVulns > 0) {
            recommendations.push(`Found ${criticalVulns} critical security vulnerabilities`)
          } else {
            recommendations.push('No critical security vulnerabilities found')
          }
        } catch (error) {
          step.status = 'failed'
          step.error = error instanceof Error ? error.message : 'Unknown error'
          step.finishedAt = new Date().toISOString()
          config.summary.failedSteps++
        }
      } else {
        const step = config.steps.find(s => s.id === 'security_scan')!
        step.status = 'skipped'
        config.summary.skippedSteps++
      }

      // Step 4: Prompt Repair
      if (config.options.promptRepair) {
        const step = config.steps.find(s => s.id === 'prompt_repair')!
        step.status = 'running'
        step.startedAt = new Date().toISOString()

        try {
          const repairAnalysis = await this.repairEngine.analyzePrompt(currentPrompt, {
            focusAreas: config.options.repairFocusAreas as any[],
            includeExamples: true,
            maxSuggestions: 10
          })

          step.results = repairAnalysis
          step.status = 'completed'
          step.finishedAt = new Date().toISOString()
          step.duration = new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()
          step.cost = repairAnalysis.cost || 0.003 // Fallback cost
          step.tokens = repairAnalysis.tokens || 200 // Fallback tokens
          config.totalCost += step.cost
          config.totalTokens += step.tokens
          config.summary.completedSteps++

          const suggestions = repairAnalysis.suggestions?.length || 0
          config.summary.suggestions = suggestions

          if (suggestions > 0) {
            const repairedPrompt = await this.repairEngine.generateRepairedPrompt(
              currentPrompt,
              repairAnalysis.suggestions,
              { severityThreshold: 'medium', confidenceThreshold: 0.6 }
            )
            currentPrompt = repairedPrompt
            recommendations.push(`Applied ${suggestions} improvement suggestions`)
          } else {
            recommendations.push('No significant improvements needed')
          }
        } catch (error) {
          step.status = 'failed'
          step.error = error instanceof Error ? error.message : 'Unknown error'
          step.finishedAt = new Date().toISOString()
          config.summary.failedSteps++
        }
      } else {
        const step = config.steps.find(s => s.id === 'prompt_repair')!
        step.status = 'skipped'
        config.summary.skippedSteps++
      }

      // Step 5: Model Adapter
      if (config.options.createAdapter && config.targetProvider && config.targetModel) {
        const step = config.steps.find(s => s.id === 'model_adapter')!
        step.status = 'running'
        step.startedAt = new Date().toISOString()

        try {
          const adapter = await this.adapterEngine.createAdapter(
            currentPrompt,
            config.targetProvider,
            config.targetModel
          )

          step.results = adapter
          step.status = 'completed'
          step.finishedAt = new Date().toISOString()
          step.duration = new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()
          step.cost = 0.001 // Estimated cost for adapter creation
          step.tokens = 150 // Estimated tokens
          config.totalCost += step.cost
          config.totalTokens += step.tokens
          config.summary.completedSteps++

          currentPrompt = adapter.adaptedPrompt
          recommendations.push(`Created optimized adapter for ${config.targetProvider}/${config.targetModel}`)
        } catch (error) {
          step.status = 'failed'
          step.error = error instanceof Error ? error.message : 'Unknown error'
          step.finishedAt = new Date().toISOString()
          config.summary.failedSteps++
        }
      } else {
        const step = config.steps.find(s => s.id === 'model_adapter')!
        step.status = 'skipped'
        config.summary.skippedSteps++
      }

      // Generate next steps based on results
      if (config.summary.failedSteps > 0) {
        nextSteps.push('Review failed steps and retry with different parameters')
      }
      if (config.summary.criticalIssues && config.summary.criticalIssues > 0) {
        nextSteps.push('Address critical security vulnerabilities immediately')
      }
      if (config.summary.suggestions && config.summary.suggestions > 0) {
        nextSteps.push('Review and apply additional improvement suggestions')
      }
      if (config.summary.averageScore && config.summary.averageScore < 8) {
        nextSteps.push('Run additional evaluations with different test cases')
      }

      config.status = 'completed'
      config.finishedAt = new Date().toISOString()

      // Calculate quality score
      let qualityScore = 0
      if (config.summary.averageScore) qualityScore += config.summary.averageScore * 0.4
      if (config.summary.criticalIssues === 0) qualityScore += 3
      if (config.summary.suggestions && config.summary.suggestions < 5) qualityScore += 2
      qualityScore = Math.min(10, qualityScore)

      const confidenceLevel = qualityScore >= 8 ? 'high' : qualityScore >= 6 ? 'medium' : 'low'

      return {
        config,
        finalPrompt: currentPrompt,
        recommendations,
        nextSteps,
        qualityScore,
        confidenceLevel
      }

    } catch (error) {
      config.status = 'failed'
      config.finishedAt = new Date().toISOString()
      throw error
    }
  }

  async getPipelineStatus(pipelineId: string): Promise<PipelineConfig | null> {
    // In a real implementation, this would fetch from a database
    // For now, return null as we don't persist pipeline state
    return null
  }

  async cancelPipeline(pipelineId: string): Promise<boolean> {
    // In a real implementation, this would cancel the running pipeline
    return true
  }
}
