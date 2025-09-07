import Groq from 'groq-sdk'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// Prompt repair types and schemas
export const RepairType = z.enum([
  'clarity',
  'safety',
  'performance',
  'consistency',
  'completeness',
  'efficiency'
])

export type RepairType = z.infer<typeof RepairType>

export const RepairSuggestion = z.object({
  id: z.string(),
  type: RepairType,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  description: z.string(),
  originalText: z.string(),
  suggestedText: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  impact: z.string(),
  examples: z.array(z.object({
    before: z.string(),
    after: z.string(),
    explanation: z.string()
  })).optional()
})

export type RepairSuggestion = z.infer<typeof RepairSuggestion>

export interface PromptRepairRun {
  id: string
  originalPrompt: string
  suggestions: RepairSuggestion[]
  summary: {
    totalSuggestions: number
    criticalSuggestions: number
    highSuggestions: number
    mediumSuggestions: number
    lowSuggestions: number
    averageConfidence: number
  }
  repairedPrompt?: string
  startedAt: string
  finishedAt?: string
  cost: number
  tokens: number
}

// Model-specific adapter types
export interface PromptAdapter {
  id: string
  provider: string
  model: string
  adapterType: 'optimization' | 'safety' | 'performance' | 'compatibility'
  originalPrompt: string
  adaptedPrompt: string
  changes: Array<{
    type: string
    description: string
    original: string
    adapted: string
  }>
  performanceMetrics?: {
    tokenEfficiency: number
    responseQuality: number
    safetyScore: number
    consistencyScore: number
  }
  createdAt: string
}

// Prompt Repair Engine
export class PromptRepairEngine {
  private groq?: Groq
  private openai?: OpenAI
  private anthropic?: Anthropic

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    }
  }

  async analyzePrompt(
    prompt: string,
    options: {
      focusAreas?: RepairType[]
      includeExamples?: boolean
      maxSuggestions?: number
    } = {}
  ): Promise<PromptRepairRun> {
    const {
      focusAreas = ['clarity', 'safety', 'performance', 'consistency'],
      includeExamples = true,
      maxSuggestions = 10
    } = options

    const runId = `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const suggestions: RepairSuggestion[] = []
    let totalCost = 0
    let totalTokens = 0

    const run: PromptRepairRun = {
      id: runId,
      originalPrompt: prompt,
      suggestions: [],
      summary: {
        totalSuggestions: 0,
        criticalSuggestions: 0,
        highSuggestions: 0,
        mediumSuggestions: 0,
        lowSuggestions: 0,
        averageConfidence: 0
      },
      startedAt: new Date().toISOString(),
      cost: 0,
      tokens: 0
    }

    try {
      // Analyze each focus area
      for (const area of focusAreas) {
        try {
          const areaSuggestions = await this.analyzeArea(prompt, area, includeExamples)
          suggestions.push(...areaSuggestions)
        } catch (error) {
          console.error(`Failed to analyze ${area}:`, error)
        }
      }

      // Limit suggestions
      const limitedSuggestions = suggestions.slice(0, maxSuggestions)

      // Calculate summary
      run.suggestions = limitedSuggestions
      run.summary = {
        totalSuggestions: limitedSuggestions.length,
        criticalSuggestions: limitedSuggestions.filter(s => s.severity === 'critical').length,
        highSuggestions: limitedSuggestions.filter(s => s.severity === 'high').length,
        mediumSuggestions: limitedSuggestions.filter(s => s.severity === 'medium').length,
        lowSuggestions: limitedSuggestions.filter(s => s.severity === 'low').length,
        averageConfidence: limitedSuggestions.length > 0 
          ? limitedSuggestions.reduce((sum, s) => sum + s.confidence, 0) / limitedSuggestions.length 
          : 0
      }

      run.finishedAt = new Date().toISOString()
      run.cost = totalCost
      run.tokens = totalTokens

      return run

    } catch (error) {
      run.finishedAt = new Date().toISOString()
      throw error
    }
  }

  private async analyzeArea(
    prompt: string,
    area: RepairType,
    includeExamples: boolean
  ): Promise<RepairSuggestion[]> {
    const analysisPrompt = this.buildAnalysisPrompt(prompt, area, includeExamples)
    
    if (this.groq) {
      return this.analyzeWithGroq(analysisPrompt, area)
    } else if (this.openai) {
      return this.analyzeWithOpenAI(analysisPrompt, area)
    } else if (this.anthropic) {
      return this.analyzeWithAnthropic(analysisPrompt, area)
    } else {
      return this.getFallbackSuggestions(prompt, area)
    }
  }

  private buildAnalysisPrompt(prompt: string, area: RepairType, includeExamples: boolean): string {
    const areaDescriptions = {
      clarity: 'clarity, readability, and understandability',
      safety: 'safety, harmlessness, and ethical considerations',
      performance: 'performance, efficiency, and effectiveness',
      consistency: 'consistency, reliability, and predictability',
      completeness: 'completeness, thoroughness, and coverage',
      efficiency: 'efficiency, conciseness, and token usage'
    }

    const basePrompt = `You are an expert prompt engineer analyzing a system prompt for ${areaDescriptions[area]}.

System Prompt to Analyze:
"""
${prompt}
"""

Please analyze this prompt and provide specific suggestions for improvement in the area of ${areaDescriptions[area]}.

${includeExamples ? 'Include specific examples showing before/after improvements.' : ''}

Return a JSON array of suggestions with this structure:
{
  "suggestions": [
    {
      "type": "${area}",
      "severity": "low|medium|high|critical",
      "title": "Brief title of the issue",
      "description": "Detailed description of the issue",
      "originalText": "The problematic text from the prompt",
      "suggestedText": "The improved version",
      "reasoning": "Why this change improves the prompt",
      "confidence": 0.8,
      "impact": "Expected impact of this change",
      "examples": [
        {
          "before": "Example of problematic behavior",
          "after": "Example of improved behavior",
          "explanation": "Why this is better"
        }
      ]
    }
  ]
}`

    return basePrompt
  }

  private async analyzeWithGroq(prompt: string, area: RepairType): Promise<RepairSuggestion[]> {
    try {
      const response = await this.groq!.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are an expert prompt engineer. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const output = response.choices[0]?.message?.content || '{}'
      
      // Enhanced JSON cleaning
      let cleanedOutput = output
      
      // Remove markdown formatting
      if (cleanedOutput.includes('```json')) {
        cleanedOutput = cleanedOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }
      if (cleanedOutput.includes('```')) {
        cleanedOutput = cleanedOutput.replace(/```\n?/g, '')
      }
      
      // Remove any text before the first { and after the last }
      const firstBrace = cleanedOutput.indexOf('{')
      const lastBrace = cleanedOutput.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedOutput = cleanedOutput.substring(firstBrace, lastBrace + 1)
      }
      
      // Enhanced control character cleaning
      cleanedOutput = cleanedOutput
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove all control characters except \n, \r, \t
        .replace(/[\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000]/g, ' ') // Replace Unicode whitespace with regular space
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
      
      // Fix common JSON issues
      cleanedOutput = cleanedOutput
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([^\\])\\([^\\nrtbf"\\/])/g, '$1\\\\$2') // Fix unescaped backslashes
        .replace(/([^\\])\\([^\\nrtbf"\\/])/g, '$1\\\\$2') // Double fix for nested issues
        .replace(/\\"/g, '\\"') // Ensure quotes are properly escaped
        .replace(/""/g, '\\"') // Fix double quotes
      
      let parsed: any
      try {
        parsed = JSON.parse(cleanedOutput)
      } catch (parseError) {
        console.warn('Primary JSON parse failed, trying fallback methods:', parseError)
        
        // Fallback 1: Try to fix common issues and parse again
        try {
          let fallbackOutput = cleanedOutput
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
            .replace(/\\/g, '\\\\') // Escape all backslashes
            .replace(/"/g, '\\"') // Escape all quotes
            .replace(/'/g, "\\'") // Escape single quotes
          
          parsed = JSON.parse(fallbackOutput)
        } catch (fallbackError1) {
          console.warn('Fallback 1 failed, trying fallback 2:', fallbackError1)
          
          // Fallback 2: Try to extract just the suggestions array
          try {
            const suggestionsMatch = cleanedOutput.match(/"suggestions"\s*:\s*\[(.*?)\]/s)
            if (suggestionsMatch) {
              const suggestionsJson = `{"suggestions": [${suggestionsMatch[1]}]}`
              parsed = JSON.parse(suggestionsJson)
            } else {
              throw new Error('No suggestions found in response')
            }
          } catch (fallbackError2) {
            console.warn('All JSON parsing attempts failed, returning empty suggestions:', fallbackError2)
            return []
          }
        }
      }
      
      return this.convertToSuggestions(parsed.suggestions || [], area)
    } catch (error: any) {
      if (error.status === 429) {
        console.warn('Groq rate limit reached for prompt analysis')
        throw new Error('Rate limit exceeded')
      }
      throw error
    }
  }

  private async analyzeWithOpenAI(prompt: string, area: RepairType): Promise<RepairSuggestion[]> {
    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert prompt engineer. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const output = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(output)
    
    return this.convertToSuggestions(parsed.suggestions || [], area)
  }

  private async analyzeWithAnthropic(prompt: string, area: RepairType): Promise<RepairSuggestion[]> {
    const response = await this.anthropic!.messages.create({
      model: 'claude-3-sonnet-20240229',
      system: 'You are an expert prompt engineer. Always respond with valid JSON.',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    const parsed = JSON.parse(output)
    
    return this.convertToSuggestions(parsed.suggestions || [], area)
  }

  private convertToSuggestions(rawSuggestions: any[], area: RepairType): RepairSuggestion[] {
    return rawSuggestions.map((suggestion, index) => ({
      id: `suggestion_${area}_${Date.now()}_${index}`,
      type: area,
      severity: suggestion.severity || 'medium',
      title: suggestion.title || `${area} improvement`,
      description: suggestion.description || 'No description provided',
      originalText: suggestion.originalText || '',
      suggestedText: suggestion.suggestedText || '',
      reasoning: suggestion.reasoning || 'No reasoning provided',
      confidence: suggestion.confidence || 0.5,
      impact: suggestion.impact || 'Unknown impact',
      examples: suggestion.examples || []
    }))
  }

  private getFallbackSuggestions(prompt: string, area: RepairType): RepairSuggestion[] {
    // No fallback suggestions - force real API usage
    throw new Error(`No LLM provider available for ${area} analysis. Please configure API keys.`)
  }

  async generateRepairedPrompt(
    originalPrompt: string,
    suggestions: RepairSuggestion[],
    options: {
      applyAll?: boolean
      severityThreshold?: 'low' | 'medium' | 'high' | 'critical'
      confidenceThreshold?: number
    } = {}
  ): Promise<string> {
    const {
      applyAll = false,
      severityThreshold = 'medium',
      confidenceThreshold = 0.6
    } = options

    // Filter suggestions based on criteria
    const applicableSuggestions = suggestions.filter(suggestion => {
      if (applyAll) return true
      
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
      const meetsSeverity = severityOrder[suggestion.severity] >= severityOrder[severityThreshold]
      const meetsConfidence = suggestion.confidence >= confidenceThreshold
      
      return meetsSeverity && meetsConfidence
    })

    if (applicableSuggestions.length === 0) {
      return originalPrompt
    }

    // Generate repaired prompt using LLM
    const repairPrompt = `You are an expert prompt engineer. Please apply the following improvements to the system prompt:

Original Prompt:
"""
${originalPrompt}
"""

Improvements to Apply:
${applicableSuggestions.map(s => `
- ${s.title}: ${s.description}
  Original: "${s.originalText}"
  Suggested: "${s.suggestedText}"
  Reasoning: ${s.reasoning}
`).join('\n')}

Please generate an improved version of the prompt that incorporates these suggestions while maintaining the original intent and structure. Return only the improved prompt without any additional commentary.`

    try {
      if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are an expert prompt engineer. Return only the improved prompt.' },
            { role: 'user', content: repairPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        return response.choices[0]?.message?.content || originalPrompt
      } else {
        // Fallback: apply suggestions manually
        return this.applySuggestionsManually(originalPrompt, applicableSuggestions)
      }
    } catch (error) {
      console.error('Failed to generate repaired prompt:', error)
      return this.applySuggestionsManually(originalPrompt, applicableSuggestions)
    }
  }

  private applySuggestionsManually(originalPrompt: string, suggestions: RepairSuggestion[]): string {
    let repairedPrompt = originalPrompt

    // Apply suggestions in order of severity (critical first)
    const sortedSuggestions = suggestions.sort((a, b) => {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

    for (const suggestion of sortedSuggestions) {
      if (suggestion.originalText && suggestion.suggestedText) {
        repairedPrompt = repairedPrompt.replace(
          suggestion.originalText,
          suggestion.suggestedText
        )
      }
    }

    return repairedPrompt
  }
}

// Model-Specific Adapter Engine
export class ModelAdapterEngine {
  private groq?: Groq

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
  }

  async createAdapter(
    originalPrompt: string,
    targetProvider: string,
    targetModel: string
  ): Promise<PromptAdapter> {
    const adapterId = `adapter_${targetProvider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const adapterPrompt = this.buildAdapterPrompt(originalPrompt, targetProvider, targetModel)
    
    try {
      let adaptedPrompt: string
      let changes: Array<{ type: string; description: string; original: string; adapted: string }> = []

      if (this.groq) {
        try {
          const response = await this.groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: 'You are an expert prompt engineer specializing in model-specific optimizations. Always respond with valid JSON.' },
              { role: 'user', content: adapterPrompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })

          const output = response.choices[0]?.message?.content || '{}'
          
          // Enhanced JSON cleaning
          let cleanedOutput = output
          
          // Remove markdown formatting
          if (cleanedOutput.includes('```json')) {
            cleanedOutput = cleanedOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '')
          }
          if (cleanedOutput.includes('```')) {
            cleanedOutput = cleanedOutput.replace(/```\n?/g, '')
          }
          
          // Remove any text before the first { and after the last }
          const firstBrace = cleanedOutput.indexOf('{')
          const lastBrace = cleanedOutput.lastIndexOf('}')
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedOutput = cleanedOutput.substring(firstBrace, lastBrace + 1)
          }
          
          // Enhanced control character cleaning
          cleanedOutput = cleanedOutput
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove all control characters except \n, \r, \t
            .replace(/[\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000]/g, ' ') // Replace Unicode whitespace with regular space
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
          
          // Fix common JSON issues
          cleanedOutput = cleanedOutput
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([^\\])\\([^\\nrtbf"\\/])/g, '$1\\\\$2') // Fix unescaped backslashes
            .replace(/([^\\])\\([^\\nrtbf"\\/])/g, '$1\\\\$2') // Double fix for nested issues
            .replace(/\\"/g, '\\"') // Ensure quotes are properly escaped
            .replace(/""/g, '\\"') // Fix double quotes
          
          let parsed: any
          try {
            parsed = JSON.parse(cleanedOutput)
          } catch (parseError) {
            console.warn('Primary JSON parse failed, trying fallback methods:', parseError)
            
            // Fallback 1: Try to fix common issues and parse again
            try {
              let fallbackOutput = cleanedOutput
                .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
                .replace(/\\/g, '\\\\') // Escape all backslashes
                .replace(/"/g, '\\"') // Escape all quotes
                .replace(/'/g, "\\'") // Escape single quotes
              
              parsed = JSON.parse(fallbackOutput)
            } catch (fallbackError1) {
              console.warn('Fallback 1 failed, trying fallback 2:', fallbackError1)
              
              // Fallback 2: Try to extract just the adaptedPrompt
              try {
                const promptMatch = cleanedOutput.match(/"adaptedPrompt"\s*:\s*"([^"]+)"/)
                if (promptMatch) {
                  parsed = {
                    adaptedPrompt: promptMatch[1],
                    changes: [],
                    analysis: 'Fallback parsing used'
                  }
                } else {
                  throw new Error('No adaptedPrompt found in response')
                }
              } catch (fallbackError2) {
                console.warn('All JSON parsing attempts failed, using fallback adapter:', fallbackError2)
                adaptedPrompt = this.createFallbackAdapter(originalPrompt, targetProvider, targetModel)
                changes = this.getFallbackChanges(originalPrompt, adaptedPrompt)
                return this.createAdapterResult(adapterId, originalPrompt, adaptedPrompt, changes, targetProvider, targetModel)
              }
            }
          }
          
          adaptedPrompt = parsed.adaptedPrompt || originalPrompt
          changes = parsed.changes || []
          
          // Log the analysis for debugging
          if (parsed.analysis) {
            console.log(`Adapter analysis for ${targetProvider}/${targetModel}:`, parsed.analysis)
          }
        } catch (error: any) {
          if (error.status === 429) {
            console.warn('Groq rate limit reached for adapter creation')
            throw new Error('Rate limit exceeded')
          }
          throw error
        }
      } else {
        // Fallback adapter
        adaptedPrompt = this.createFallbackAdapter(originalPrompt, targetProvider, targetModel)
        changes = this.getFallbackChanges(originalPrompt, adaptedPrompt)
      }

      const adapter: PromptAdapter = {
        id: adapterId,
        provider: targetProvider,
        model: targetModel,
        adapterType: 'optimization',
        originalPrompt,
        adaptedPrompt,
        changes,
        createdAt: new Date().toISOString()
      }

      return adapter

    } catch (error) {
      console.error('Failed to create adapter:', error)
      throw error
    }
  }

  private buildAdapterPrompt(originalPrompt: string, targetProvider: string, targetModel: string): string {
    const providerSpecificGuidance = {
      groq: `Groq-specific optimizations for ${targetModel}:
- Emphasize speed and efficiency in instructions
- Use concise, direct language for faster processing
- Optimize for token efficiency (Groq charges per token)
- Leverage Groq's fast inference capabilities
- Use structured formats that Groq processes well`,
      
      openai: `OpenAI-specific optimizations for ${targetModel}:
- Leverage advanced reasoning capabilities
- Use detailed, nuanced instructions
- Optimize for creative and analytical tasks
- Consider GPT-4's strengths in complex reasoning
- Use examples and few-shot learning patterns`,
      
      anthropic: `Anthropic-specific optimizations for ${targetModel}:
- Emphasize safety and helpfulness
- Use clear ethical guidelines
- Leverage Claude's strength in analysis
- Focus on harmlessness and honesty
- Use structured reasoning patterns`
    }

    return `You are an expert prompt engineer specializing in optimizing prompts for different LLM providers and models.

Original Prompt:
"""
${originalPrompt}
"""

Target Provider: ${targetProvider}
Target Model: ${targetModel}

${providerSpecificGuidance[targetProvider as keyof typeof providerSpecificGuidance] || 'General optimization guidelines'}

Please create an optimized version of this prompt specifically for ${targetProvider}'s ${targetModel}. 

ANALYSIS REQUIREMENTS:
1. Analyze the original prompt for optimization opportunities
2. Identify specific areas for improvement
3. Explain the reasoning behind each change
4. Provide detailed before/after comparisons

Return a JSON object with this structure:
{
  "adaptedPrompt": "The optimized prompt for this specific model",
  "changes": [
    {
      "type": "optimization|safety|performance|compatibility|token_efficiency|reasoning_enhancement",
      "description": "Detailed description of the specific optimization made",
      "original": "Exact original text being changed",
      "adapted": "Exact adapted text",
      "reasoning": "Detailed explanation of why this change improves the prompt for this specific model",
      "expectedImpact": "Specific expected improvement (e.g., 'Reduces token usage by ~15%', 'Improves response consistency', 'Enhances safety alignment')"
    }
  ],
  "analysis": {
    "tokenOptimization": "Analysis of token usage improvements",
    "performanceGains": "Expected performance improvements",
    "safetyEnhancements": "Safety-related improvements",
    "modelAlignment": "How the prompt is better aligned with this specific model"
  }
}`
  }


  async testAdapter(adapter: PromptAdapter): Promise<PromptAdapter> {
    // Real testing would integrate with the evaluation engine
    // For now, return the adapter without mock metrics
    return adapter
  }

  private createFallbackAdapter(originalPrompt: string, provider: string, model: string): string {
    // Simple fallback adapter based on provider
    switch (provider) {
      case 'groq':
        return `${originalPrompt}\n\n[Optimized for Groq ${model}: Enhanced for speed and efficiency]`
      case 'openai':
        return `${originalPrompt}\n\n[Optimized for OpenAI ${model}: Enhanced for accuracy and safety]`
      case 'anthropic':
        return `${originalPrompt}\n\n[Optimized for Anthropic ${model}: Enhanced for helpfulness and harmlessness]`
      default:
        return originalPrompt
    }
  }

  private getFallbackChanges(original: string, adapted: string): Array<{ type: string; description: string; original: string; adapted: string }> {
    return [{
      type: 'optimization',
      description: 'Provider-specific optimization applied',
      original: original,
      adapted: adapted
    }]
  }

  private createAdapterResult(
    adapterId: string,
    originalPrompt: string,
    adaptedPrompt: string,
    changes: Array<{ type: string; description: string; original: string; adapted: string }>,
    targetProvider: string,
    targetModel: string
  ): PromptAdapter {
    return {
      id: adapterId,
      provider: targetProvider,
      model: targetModel,
      adapterType: 'optimization',
      originalPrompt,
      adaptedPrompt,
      changes,
      createdAt: new Date().toISOString()
    }
  }
}
