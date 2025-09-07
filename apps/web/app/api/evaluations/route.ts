import { NextRequest, NextResponse } from 'next/server'
import { EvaluationEngine, EvaluationRequest } from '@/lib/evaluation-engine'

const evaluationEngine = new EvaluationEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const evalRequest: EvaluationRequest = {
      systemPrompt: body.systemPrompt || 'You are a helpful assistant.',
      userMessage: body.userMessage || 'Hello, how can you help me?',
      expectedBehavior: body.expectedBehavior,
      providers: body.providers || [
        { name: 'groq', model: 'llama-3.1-70b-versatile', apiKey: process.env.GROQ_API_KEY || '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' },
        { name: 'openai', model: 'gpt-4', apiKey: process.env.OPENAI_API_KEY || '' },
        { name: 'anthropic', model: 'claude-3-sonnet', apiKey: process.env.ANTHROPIC_API_KEY || '' }
      ].filter(p => p.apiKey)
    }

    if (evalRequest.providers.length === 0) {
      return NextResponse.json({ 
        error: 'No providers available. Please configure API keys.' 
      }, { status: 400 })
    }

    // Run evaluation
    const result = await evaluationEngine.runEvaluation(evalRequest)

    return NextResponse.json({ 
      success: true, 
      data: result 
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json({ 
      error: 'Evaluation failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const availableProviders = evaluationEngine.getAvailableProviders()
    
    return NextResponse.json({ 
      success: true, 
      data: {
        availableProviders,
        totalProviders: availableProviders.length
      }
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch providers' 
    }, { status: 500 })
  }
}
