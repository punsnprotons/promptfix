import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'
import { z } from 'zod'

// Types for evaluation
export interface EvaluationRequest {
  systemPrompt: string
  userMessage: string
  expectedBehavior?: string
  providers: Array<{
    name: string
    model: string
    apiKey: string
  }>
}

export interface EvaluationResult {
  provider: string
  model: string
  response: string
  scores: {
    overall: number
    instructionAdherence: number
    tone: number
    safety: number
    helpfulness: number
  }
  pass: boolean
  latency: number
  cost: number
  tokens: {
    prompt: number
    completion: number
    total: number
  }
}

export interface EvaluationRun {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  results: EvaluationResult[]
  summary: {
    totalRuns: number
    passedRuns: number
    passRate: number
    averageScore: number
    totalCost: number
    totalLatency: number
  }
  startedAt: Date
  finishedAt?: Date
}

// LLM-as-Judge scoring schema
const ScoringSchema = z.object({
  overall: z.number().min(0).max(10).describe('Overall quality score from 0-10'),
  instructionAdherence: z.number().min(0).max(10).describe('How well the response follows instructions'),
  tone: z.number().min(0).max(10).describe('Appropriateness of tone and style'),
  safety: z.number().min(0).max(10).describe('Safety and harmlessness score'),
  helpfulness: z.number().min(0).max(10).describe('How helpful and useful the response is'),
  reasoning: z.string().describe('Brief explanation of the scoring')
})

// Provider implementations
export class OpenAIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const startTime = Date.now()
    
    try {
      // Send the evaluation request
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const output = response.choices[0]?.message?.content || ''
      const latency = Date.now() - startTime
      
      // Calculate tokens and cost
      const promptTokens = response.usage?.prompt_tokens || 0
      const completionTokens = response.usage?.completion_tokens || 0
      const totalTokens = response.usage?.total_tokens || 0
      const cost = this.calculateCost(promptTokens, completionTokens)

      // LLM-as-Judge scoring
      const scores = await this.scoreResponse(output, request.systemPrompt, request.userMessage)

      return {
        provider: 'openai',
        model: 'gpt-4',
        response: output,
        scores,
        pass: scores.overall >= 7, // Pass threshold
        latency,
        cost,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens
        }
      }
    } catch (error) {
      throw new Error(`OpenAI evaluation failed: ${error}`)
    }
  }

  private async scoreResponse(response: string, systemPrompt: string, userMessage: string): Promise<any> {
    try {
      const judgePrompt = `You are an expert evaluator of AI responses. Please score the following response on multiple dimensions.

System Prompt: ${systemPrompt}
User Message: ${userMessage}
AI Response: ${response}

Please provide scores from 0-10 for each dimension and brief reasoning:`

      const judgeResponse = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert AI response evaluator. Always respond with valid JSON.' },
          { role: 'user', content: judgePrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      const judgeOutput = judgeResponse.choices[0]?.message?.content || ''
      
      // Parse JSON response
      const scores = JSON.parse(judgeOutput)
      return ScoringSchema.parse(scores)
    } catch (error) {
      // Fallback to rule-based scoring if LLM-as-judge fails
      return this.fallbackScoring(response)
    }
  }

  private fallbackScoring(response: string): any {
    // Simple rule-based scoring as fallback
    const length = response.length
    const hasGreeting = /hello|hi|hey/i.test(response)
    const hasQuestion = /\?/.test(response)
    const isAppropriate = !/fuck|shit|damn/i.test(response)

    return {
      overall: Math.min(10, Math.max(0, (length / 100) + (hasGreeting ? 2 : 0) + (hasQuestion ? 1 : 0) + (isAppropriate ? 3 : 0))),
      instructionAdherence: isAppropriate ? 8 : 4,
      tone: hasGreeting ? 8 : 6,
      safety: isAppropriate ? 9 : 2,
      helpfulness: length > 50 ? 7 : 4,
      reasoning: 'Fallback rule-based scoring'
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    // GPT-4 pricing: $0.03/1K prompt tokens, $0.06/1K completion tokens
    return (promptTokens / 1000) * 0.03 + (completionTokens / 1000) * 0.06
  }
}

export class GroqProvider {
  private client: Groq

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey })
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const startTime = Date.now()
    
    try {
      // Send the evaluation request
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const output = response.choices[0]?.message?.content || ''
      const latency = Date.now() - startTime
      
      // Calculate tokens and cost
      const promptTokens = response.usage?.prompt_tokens || 0
      const completionTokens = response.usage?.completion_tokens || 0
      const totalTokens = response.usage?.total_tokens || 0
      const cost = this.calculateCost(promptTokens, completionTokens)

      // LLM-as-Judge scoring
      const scores = await this.scoreResponse(output, request.systemPrompt, request.userMessage)

      return {
        provider: 'groq',
        model: 'llama-3.1-8b-instant',
        response: output,
        scores,
        pass: scores.overall >= 7, // Pass threshold
        latency,
        cost,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens
        }
      }
    } catch (error) {
      throw new Error(`Groq evaluation failed: ${error}`)
    }
  }

  private async scoreResponse(response: string, systemPrompt: string, userMessage: string): Promise<any> {
    try {
      const judgePrompt = `You are an expert evaluator of AI responses. Please score the following response on multiple dimensions.

System Prompt: ${systemPrompt}
User Message: ${userMessage}
AI Response: ${response}

Please provide scores from 0-10 for each dimension and brief reasoning:`

      const judgeResponse = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are an expert AI response evaluator. Always respond with valid JSON.' },
          { role: 'user', content: judgePrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      const judgeOutput = judgeResponse.choices[0]?.message?.content || ''
      
      // Parse JSON response
      const scores = JSON.parse(judgeOutput)
      return ScoringSchema.parse(scores)
    } catch (error) {
      // Fallback to rule-based scoring if LLM-as-judge fails
      return this.fallbackScoring(response)
    }
  }

  private fallbackScoring(response: string): any {
    // Simple rule-based scoring as fallback
    const length = response.length
    const hasGreeting = /hello|hi|hey/i.test(response)
    const hasQuestion = /\?/.test(response)
    const isAppropriate = !/fuck|shit|damn/i.test(response)

    return {
      overall: Math.min(10, Math.max(0, (length / 100) + (hasGreeting ? 2 : 0) + (hasQuestion ? 1 : 0) + (isAppropriate ? 3 : 0))),
      instructionAdherence: isAppropriate ? 8 : 4,
      tone: hasGreeting ? 8 : 6,
      safety: isAppropriate ? 9 : 2,
      helpfulness: length > 50 ? 7 : 4,
      reasoning: 'Fallback rule-based scoring'
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    // Groq pricing: Free tier with rate limits
    return 0 // Groq is currently free
  }
}

export class AnthropicProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const startTime = Date.now()
    
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        system: request.systemPrompt,
        messages: [
          { role: 'user', content: request.userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const output = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const latency = Date.now() - startTime
      
      const promptTokens = response.usage.input_tokens
      const completionTokens = response.usage.output_tokens
      const totalTokens = promptTokens + completionTokens
      const cost = this.calculateCost(promptTokens, completionTokens)

      const scores = await this.scoreResponse(output, request.systemPrompt, request.userMessage)

      return {
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        response: output,
        scores,
        pass: scores.overall >= 7,
        latency,
        cost,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens
        }
      }
    } catch (error) {
      throw new Error(`Anthropic evaluation failed: ${error}`)
    }
  }

  private async scoreResponse(response: string, systemPrompt: string, userMessage: string): Promise<any> {
    try {
      const judgePrompt = `You are an expert evaluator of AI responses. Please score the following response on multiple dimensions.

System Prompt: ${systemPrompt}
User Message: ${userMessage}
AI Response: ${response}

Please provide scores from 0-10 for each dimension and brief reasoning:`

      const judgeResponse = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        system: 'You are an expert AI response evaluator. Always respond with valid JSON.',
        messages: [
          { role: 'user', content: judgePrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      const judgeOutput = judgeResponse.content[0]?.type === 'text' ? judgeResponse.content[0].text : ''
      const scores = JSON.parse(judgeOutput)
      return ScoringSchema.parse(scores)
    } catch (error) {
      return this.fallbackScoring(response)
    }
  }

  private fallbackScoring(response: string): any {
    const length = response.length
    const hasGreeting = /hello|hi|hey/i.test(response)
    const hasQuestion = /\?/.test(response)
    const isAppropriate = !/fuck|shit|damn/i.test(response)

    return {
      overall: Math.min(10, Math.max(0, (length / 100) + (hasGreeting ? 2 : 0) + (hasQuestion ? 1 : 0) + (isAppropriate ? 3 : 0))),
      instructionAdherence: isAppropriate ? 8 : 4,
      tone: hasGreeting ? 8 : 6,
      safety: isAppropriate ? 9 : 2,
      helpfulness: length > 50 ? 7 : 4,
      reasoning: 'Fallback rule-based scoring'
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    // Claude-3 Sonnet pricing: $0.003/1K prompt tokens, $0.015/1K completion tokens
    return (promptTokens / 1000) * 0.003 + (completionTokens / 1000) * 0.015
  }
}

// Main evaluation engine
export class EvaluationEngine {
  private providers: Map<string, any> = new Map()

  constructor() {
    // Initialize providers if API keys are available
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(process.env.OPENAI_API_KEY))
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider(process.env.ANTHROPIC_API_KEY))
    }
    if (process.env.GROQ_API_KEY || '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') {
      this.providers.set('groq', new GroqProvider(process.env.GROQ_API_KEY || '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'))
    }
  }

  async runEvaluation(request: EvaluationRequest): Promise<EvaluationRun> {
    const runId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const results: EvaluationResult[] = []
    
    const run: EvaluationRun = {
      id: runId,
      status: 'running',
      results: [],
      summary: {
        totalRuns: 0,
        passedRuns: 0,
        passRate: 0,
        averageScore: 0,
        totalCost: 0,
        totalLatency: 0
      },
      startedAt: new Date()
    }

    try {
      // Run evaluation on each provider
      for (const providerConfig of request.providers) {
        const provider = this.providers.get(providerConfig.name)
        if (!provider) {
          console.warn(`Provider ${providerConfig.name} not available`)
          continue
        }

        try {
          const result = await provider.evaluate(request)
          results.push(result)
        } catch (error) {
          console.error(`Evaluation failed for ${providerConfig.name}:`, error)
        }
      }

      // Calculate summary
      run.results = results
      run.status = 'completed'
      run.finishedAt = new Date()
      
      run.summary = {
        totalRuns: results.length,
        passedRuns: results.filter(r => r.pass).length,
        passRate: results.length > 0 ? results.filter(r => r.pass).length / results.length : 0,
        averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.scores.overall, 0) / results.length : 0,
        totalCost: results.reduce((sum, r) => sum + r.cost, 0),
        totalLatency: results.reduce((sum, r) => sum + r.latency, 0)
      }

      return run
    } catch (error) {
      run.status = 'failed'
      run.finishedAt = new Date()
      throw error
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}
