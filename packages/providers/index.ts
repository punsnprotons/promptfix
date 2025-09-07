import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import axios from 'axios'
import { 
  Provider, 
  ProviderType, 
  ProviderRequest, 
  ProviderResponse, 
  ProviderError,
  retryWithBackoff,
  calculateCost,
  extractTokens
} from '@system-prompt-tool/shared'

// OpenAI Provider
export class OpenAIProvider implements Provider {
  readonly name = 'openai'
  readonly type: ProviderType = 'openai'
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async send(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    
    try {
      const response = await retryWithBackoff(async () => {
        return await this.client.chat.completions.create({
          model: request.model,
          messages: request.messages.map(msg => ({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content,
          })),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: request.stream,
        })
      })

      const output = response.choices[0]?.message?.content || ''
      const promptTokens = response.usage?.prompt_tokens || 0
      const completionTokens = response.usage?.completion_tokens || 0
      const totalTokens = response.usage?.total_tokens || 0
      const latency = Date.now() - startTime
      const cost = calculateCost(totalTokens, this.name, request.model)

      return {
        output,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens,
        },
        cost,
        latency,
        model: request.model,
        provider: this.name,
      }
    } catch (error: any) {
      throw new ProviderError(
        `OpenAI API error: ${error.message}`,
        this.name,
        request.model,
        error.status
      )
    }
  }

  validateConfig(config: any): boolean {
    return config.apiKey && typeof config.apiKey === 'string'
  }

  estimateCost(request: ProviderRequest): number {
    const estimatedTokens = request.messages.reduce((total, msg) => {
      return total + extractTokens(msg.content)
    }, 0) + (request.maxTokens || 1000)
    
    return calculateCost(estimatedTokens, this.name, request.model)
  }
}

// Anthropic Provider
export class AnthropicProvider implements Provider {
  readonly name = 'anthropic'
  readonly type: ProviderType = 'anthropic'
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async send(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    
    try {
      // Separate system message from other messages
      const systemMessage = request.messages.find(msg => msg.role === 'system')
      const otherMessages = request.messages.filter(msg => msg.role !== 'system')

      const response = await retryWithBackoff(async () => {
        return await this.client.messages.create({
          model: request.model,
          system: systemMessage?.content,
          messages: otherMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          temperature: request.temperature,
          max_tokens: request.maxTokens || 1000,
        })
      })

      const output = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const promptTokens = response.usage.input_tokens
      const completionTokens = response.usage.output_tokens
      const totalTokens = promptTokens + completionTokens
      const latency = Date.now() - startTime
      const cost = calculateCost(totalTokens, this.name, request.model)

      return {
        output,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens,
        },
        cost,
        latency,
        model: request.model,
        provider: this.name,
      }
    } catch (error: any) {
      throw new ProviderError(
        `Anthropic API error: ${error.message}`,
        this.name,
        request.model,
        error.status
      )
    }
  }

  validateConfig(config: any): boolean {
    return config.apiKey && typeof config.apiKey === 'string'
  }

  estimateCost(request: ProviderRequest): number {
    const estimatedTokens = request.messages.reduce((total, msg) => {
      return total + extractTokens(msg.content)
    }, 0) + (request.maxTokens || 1000)
    
    return calculateCost(estimatedTokens, this.name, request.model)
  }
}

// Google Provider (Gemini)
export class GoogleProvider implements Provider {
  readonly name = 'google'
  readonly type: ProviderType = 'google'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    
    try {
      const response = await retryWithBackoff(async () => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${this.apiKey}`
        
        const payload = {
          contents: request.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
          },
        }

        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
        })

        return response.data
      })

      const output = response.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const promptTokens = response.usageMetadata?.promptTokenCount || 0
      const completionTokens = response.usageMetadata?.candidatesTokenCount || 0
      const totalTokens = response.usageMetadata?.totalTokenCount || 0
      const latency = Date.now() - startTime
      const cost = calculateCost(totalTokens, this.name, request.model)

      return {
        output,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens,
        },
        cost,
        latency,
        model: request.model,
        provider: this.name,
      }
    } catch (error: any) {
      throw new ProviderError(
        `Google API error: ${error.message}`,
        this.name,
        request.model,
        error.response?.status
      )
    }
  }

  validateConfig(config: any): boolean {
    return config.apiKey && typeof config.apiKey === 'string'
  }

  estimateCost(request: ProviderRequest): number {
    const estimatedTokens = request.messages.reduce((total, msg) => {
      return total + extractTokens(msg.content)
    }, 0) + (request.maxTokens || 1000)
    
    return calculateCost(estimatedTokens, this.name, request.model)
  }
}

// Ollama Provider (Local)
export class OllamaProvider implements Provider {
  readonly name = 'ollama'
  readonly type: ProviderType = 'ollama'
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl
  }

  async send(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    
    try {
      const response = await retryWithBackoff(async () => {
        const url = `${this.baseUrl}/api/generate`
        
        const payload = {
          model: request.model,
          messages: request.messages,
          options: {
            temperature: request.temperature,
            num_predict: request.maxTokens,
          },
        }

        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
        })

        return response.data
      })

      const output = response.response || ''
      const promptTokens = extractTokens(request.messages.map(m => m.content).join(' '))
      const completionTokens = extractTokens(output)
      const totalTokens = promptTokens + completionTokens
      const latency = Date.now() - startTime
      const cost = 0 // Local models have no cost

      return {
        output,
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens,
        },
        cost,
        latency,
        model: request.model,
        provider: this.name,
      }
    } catch (error: any) {
      throw new ProviderError(
        `Ollama API error: ${error.message}`,
        this.name,
        request.model,
        error.response?.status
      )
    }
  }

  validateConfig(config: any): boolean {
    return config.baseUrl && typeof config.baseUrl === 'string'
  }

  estimateCost(request: ProviderRequest): number {
    return 0 // Local models have no cost
  }
}

// Provider factory
export class ProviderFactory {
  static create(type: ProviderType, config: any): Provider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config.apiKey)
      case 'anthropic':
        return new AnthropicProvider(config.apiKey)
      case 'google':
        return new GoogleProvider(config.apiKey)
      case 'ollama':
        return new OllamaProvider(config.baseUrl)
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}

// Export all providers
export * from '@system-prompt-tool/shared'
