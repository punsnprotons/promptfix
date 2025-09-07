import { NextRequest, NextResponse } from 'next/server'
import { PromptRepairEngine, ModelAdapterEngine } from '@/lib/prompt-repair-engine'

const repairEngine = new PromptRepairEngine()
const adapterEngine = new ModelAdapterEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'analyze') {
      const {
        prompt,
        focusAreas = ['clarity', 'safety', 'performance', 'consistency'],
        includeExamples = true,
        maxSuggestions = 10
      } = body

      if (!prompt) {
        return NextResponse.json({ 
          error: 'Prompt is required for analysis' 
        }, { status: 400 })
      }

      const result = await repairEngine.analyzePrompt(prompt, {
        focusAreas,
        includeExamples,
        maxSuggestions
      })

      return NextResponse.json({ 
        success: true, 
        data: result 
      })
    }

    if (action === 'repair') {
      const {
        originalPrompt,
        suggestions,
        applyAll = false,
        severityThreshold = 'medium',
        confidenceThreshold = 0.6
      } = body

      if (!originalPrompt || !suggestions) {
        return NextResponse.json({ 
          error: 'Original prompt and suggestions are required' 
        }, { status: 400 })
      }

      const repairedPrompt = await repairEngine.generateRepairedPrompt(
        originalPrompt,
        suggestions,
        {
          applyAll,
          severityThreshold,
          confidenceThreshold
        }
      )

      return NextResponse.json({ 
        success: true, 
        data: {
          originalPrompt,
          repairedPrompt,
          appliedSuggestions: suggestions.length
        }
      })
    }

    if (action === 'create-adapter') {
      const {
        originalPrompt,
        targetProvider,
        targetModel
      } = body

      if (!originalPrompt || !targetProvider || !targetModel) {
        return NextResponse.json({ 
          error: 'Original prompt, target provider, and target model are required' 
        }, { status: 400 })
      }

      const adapter = await adapterEngine.createAdapter(
        originalPrompt,
        targetProvider,
        targetModel
      )

      return NextResponse.json({ 
        success: true, 
        data: adapter 
      })
    }

    if (action === 'test-adapter') {
      const { adapter } = body

      if (!adapter) {
        return NextResponse.json({ 
          error: 'Adapter is required for testing' 
        }, { status: 400 })
      }

      const testedAdapter = await adapterEngine.testAdapter(adapter)

      return NextResponse.json({ 
        success: true, 
        data: testedAdapter 
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action. Supported actions: analyze, repair, create-adapter, test-adapter' 
    }, { status: 400 })

  } catch (error) {
    console.error('Prompt repair error:', error)
    return NextResponse.json({ 
      error: 'Prompt repair failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'focus-areas') {
      return NextResponse.json({ 
        success: true, 
        data: {
          focusAreas: [
            { id: 'clarity', name: 'Clarity', description: 'Improve readability and understandability' },
            { id: 'safety', name: 'Safety', description: 'Enhance safety and ethical considerations' },
            { id: 'performance', name: 'Performance', description: 'Optimize for better performance' },
            { id: 'consistency', name: 'Consistency', description: 'Improve reliability and predictability' },
            { id: 'completeness', name: 'Completeness', description: 'Ensure thoroughness and coverage' },
            { id: 'efficiency', name: 'Efficiency', description: 'Optimize for token usage and speed' }
          ]
        }
      })
    }

    if (action === 'providers') {
      return NextResponse.json({ 
        success: true, 
        data: {
          providers: [
            { id: 'groq', name: 'Groq', models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile'] },
            { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
            { id: 'anthropic', name: 'Anthropic', models: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'] }
          ]
        }
      })
    }

    // Return available actions and configuration
    return NextResponse.json({ 
      success: true, 
      data: {
        availableActions: ['analyze', 'repair', 'create-adapter', 'test-adapter'],
        defaultFocusAreas: ['clarity', 'safety', 'performance', 'consistency'],
        severityLevels: ['low', 'medium', 'high', 'critical'],
        adapterTypes: ['optimization', 'safety', 'performance', 'compatibility']
      }
    })
  } catch (error) {
    console.error('Error fetching prompt repair info:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch prompt repair information' 
    }, { status: 500 })
  }
}
