import { NextRequest, NextResponse } from 'next/server'
import { AutoPipelineEngine } from '@/lib/auto-pipeline-engine'

const pipelineEngine = new AutoPipelineEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'run-pipeline') {
      const {
        originalPrompt,
        targetProvider,
        targetModel,
        generateScenarios = true,
        runEvaluation = true,
        securityScan = true,
        promptRepair = true,
        createAdapter = true,
        scenarioCount = 10,
        evaluationProviders = ['groq'],
        repairFocusAreas = ['clarity', 'safety', 'performance'],
        securityAttackTypes = ['prompt_injection', 'data_exfiltration']
      } = body

      if (!originalPrompt) {
        return NextResponse.json({ 
          error: 'Original prompt is required for pipeline execution' 
        }, { status: 400 })
      }

      const result = await pipelineEngine.runAutoPipeline(originalPrompt, {
        targetProvider,
        targetModel,
        generateScenarios,
        runEvaluation,
        securityScan,
        promptRepair,
        createAdapter,
        scenarioCount,
        evaluationProviders,
        repairFocusAreas,
        securityAttackTypes
      })

      return NextResponse.json({ 
        success: true, 
        data: result 
      })
    }

    if (action === 'get-status') {
      const { pipelineId } = body

      if (!pipelineId) {
        return NextResponse.json({ 
          error: 'Pipeline ID is required' 
        }, { status: 400 })
      }

      const status = await pipelineEngine.getPipelineStatus(pipelineId)

      return NextResponse.json({ 
        success: true, 
        data: status 
      })
    }

    if (action === 'cancel-pipeline') {
      const { pipelineId } = body

      if (!pipelineId) {
        return NextResponse.json({ 
          error: 'Pipeline ID is required' 
        }, { status: 400 })
      }

      const cancelled = await pipelineEngine.cancelPipeline(pipelineId)

      return NextResponse.json({ 
        success: true, 
        data: { cancelled } 
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action. Supported actions: run-pipeline, get-status, cancel-pipeline' 
    }, { status: 400 })

  } catch (error) {
    console.error('Auto pipeline error:', error)
    return NextResponse.json({ 
      error: 'Auto pipeline failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'config') {
      return NextResponse.json({ 
        success: true, 
        data: {
          availableProviders: ['groq', 'openai', 'anthropic'],
          availableModels: {
            groq: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile'],
            openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            anthropic: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus']
          },
          repairFocusAreas: [
            { id: 'clarity', name: 'Clarity', description: 'Improve readability and understandability' },
            { id: 'safety', name: 'Safety', description: 'Enhance safety and ethical considerations' },
            { id: 'performance', name: 'Performance', description: 'Optimize for better performance' },
            { id: 'consistency', name: 'Consistency', description: 'Improve reliability and predictability' },
            { id: 'completeness', name: 'Completeness', description: 'Ensure thoroughness and coverage' },
            { id: 'efficiency', name: 'Efficiency', description: 'Optimize for token usage and speed' }
          ],
          securityAttackTypes: [
            { id: 'prompt_injection', name: 'Prompt Injection', description: 'Test for prompt injection vulnerabilities' },
            { id: 'data_exfiltration', name: 'Data Exfiltration', description: 'Test for data leakage' },
            { id: 'role_confusion', name: 'Role Confusion', description: 'Test for role manipulation' },
            { id: 'jailbreak', name: 'Jailbreak', description: 'Test for safety guardrail bypass' }
          ],
          defaultOptions: {
            generateScenarios: true,
            runEvaluation: true,
            securityScan: true,
            promptRepair: true,
            createAdapter: true,
            scenarioCount: 10,
            evaluationProviders: ['groq'],
            repairFocusAreas: ['clarity', 'safety', 'performance'],
            securityAttackTypes: ['prompt_injection', 'data_exfiltration']
          }
        }
      })
    }

    // Return available actions and configuration
    return NextResponse.json({ 
      success: true, 
      data: {
        availableActions: ['run-pipeline', 'get-status', 'cancel-pipeline'],
        description: 'Auto Pipeline Engine - Comprehensive prompt analysis and optimization workflow',
        features: [
          'Automatic scenario generation',
          'Multi-provider evaluation',
          'Security vulnerability scanning',
          'AI-powered prompt repair',
          'Model-specific optimization',
          'Real-time progress tracking',
          'Comprehensive reporting'
        ]
      }
    })
  } catch (error) {
    console.error('Error fetching auto pipeline info:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch auto pipeline information' 
    }, { status: 500 })
  }
}
