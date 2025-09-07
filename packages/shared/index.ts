import { ProviderType, ProviderRequest, ProviderResponse, Message } from './types'

// Provider interface
export interface Provider {
  readonly name: string
  readonly type: ProviderType
  
  send(request: ProviderRequest): Promise<ProviderResponse>
  validateConfig(config: any): boolean
  estimateCost(request: ProviderRequest): number
}

// Provider registry
export class ProviderRegistry {
  private providers = new Map<string, Provider>()

  register(provider: Provider): void {
    this.providers.set(provider.name, provider)
  }

  get(name: string): Provider | undefined {
    return this.providers.get(name)
  }

  list(): Provider[] {
    return Array.from(this.providers.values())
  }

  getByType(type: ProviderType): Provider[] {
    return this.list().filter(p => p.type === type)
  }
}

// Utility functions
export function formatMessages(messages: Message[]): string {
  return messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n')
}

export function extractTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

export function calculateCost(tokens: number, provider: string, model: string): number {
  // Pricing per 1K tokens (as of 2024)
  const pricing: Record<string, Record<string, { input: number; output: number }>> = {
    openai: {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    },
    anthropic: {
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    },
    google: {
      'gemini-pro': { input: 0.0005, output: 0.0015 },
    },
  }

  const modelPricing = pricing[provider]?.[model]
  if (!modelPricing) {
    return 0 // Unknown pricing
  }

  // Assume 50/50 input/output split for estimation
  const inputTokens = Math.ceil(tokens * 0.5)
  const outputTokens = Math.ceil(tokens * 0.5)
  
  return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const attempt = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        attempts++
        
        if (attempts >= maxRetries) {
          reject(error)
          return
        }

        const delay = baseDelay * Math.pow(2, attempts - 1)
        setTimeout(attempt, delay)
      }
    }

    attempt()
  })
}

// Validation utilities
export function validateApiKey(provider: string, apiKey: string): boolean {
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[A-Za-z0-9]{48}$/,
    anthropic: /^sk-ant-[A-Za-z0-9-]{95}$/,
    google: /^[A-Za-z0-9_-]{39}$/,
  }

  const pattern = patterns[provider]
  return pattern ? pattern.test(apiKey) : apiKey.length > 0
}

export function sanitizeOutput(output: string): string {
  // Remove potential PII patterns
  return output
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_NUMBER]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
}

// Scoring utilities
export function calculateOverallScore(scores: Record<string, number>, weights?: Record<string, number>): number {
  const defaultWeights = {
    instruction_adherence: 0.3,
    tone: 0.2,
    security: 0.25,
    format_compliance: 0.15,
    harmlessness: 0.1,
  }

  const finalWeights = { ...defaultWeights, ...weights }
  
  let totalScore = 0
  let totalWeight = 0

  for (const [key, score] of Object.entries(scores)) {
    const weight = finalWeights[key] || 0
    totalScore += score * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

export function determinePass(scores: Record<string, number>, threshold: number = 0.8): boolean {
  const overallScore = calculateOverallScore(scores)
  return overallScore >= threshold
}

// Export everything
export * from './types'
