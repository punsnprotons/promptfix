import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectName,
      projectDescription,
      originalPrompt,
      pipelineResult,
      optimizedPrompt
    } = body

    if (!projectName || !originalPrompt || !pipelineResult) {
      return NextResponse.json({ 
        error: 'Missing required fields: projectName, originalPrompt, pipelineResult' 
      }, { status: 400 })
    }

    // Use the user ID from the session (NextAuth already provides this)
    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 })
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectName,
        description: projectDescription || '',
        system_prompt: originalPrompt,
        user_id: userId
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project creation error:', projectError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    const projectId = project.id

    // Save complete pipeline run for activity tracking
    if (pipelineResult.config) {
      await supabase.from('pipeline_runs').insert({
        project_id: projectId,
        name: `Auto-Pipeline Run - ${new Date().toLocaleDateString()}`,
        config: pipelineResult.config,
        status: pipelineResult.config.status || 'completed',
        summary: {
          totalSteps: pipelineResult.config.summary?.totalSteps || 0,
          completedSteps: pipelineResult.config.summary?.completedSteps || 0,
          totalCost: pipelineResult.config.totalCost || 0,
          totalTokens: pipelineResult.config.totalTokens || 0
        }
      })
    }

    // Save prompt version (original)
    await supabase.from('prompt_versions').insert({
      project_id: projectId,
      version_number: 1,
      prompt_text: originalPrompt,
      changes: 'Initial version',
      created_by: userId
    })

    // Save optimized prompt version if available
    if (optimizedPrompt && optimizedPrompt !== originalPrompt) {
      await supabase.from('prompt_versions').insert({
        project_id: projectId,
        version_number: 2,
        prompt_text: optimizedPrompt,
        changes: 'Auto-pipeline optimization',
        created_by: userId
      })
    }

    // Save scenario suite if available
    if (pipelineResult.config?.steps) {
      const scenarioStep = pipelineResult.config.steps.find((s: any) => s.id === 'scenario_generation')
      if (scenarioStep?.results && Array.isArray(scenarioStep.results)) {
        await supabase.from('scenario_suites').insert({
          project_id: projectId,
          name: 'Auto-Pipeline Generated Scenarios',
          scenarios: scenarioStep.results
        })
      }
    }

    // Save evaluation run if available
    if (pipelineResult.config?.steps) {
      const evaluationStep = pipelineResult.config.steps.find((s: any) => s.id === 'evaluation')
      if (evaluationStep?.results) {
        await supabase.from('evaluation_runs').insert({
          project_id: projectId,
          name: 'Auto-Pipeline Evaluation',
          status: evaluationStep.status || 'completed',
          results: evaluationStep.results,
          total_cost: evaluationStep.cost || 0,
          total_tokens: evaluationStep.tokens || 0
        })
      }
    }

    // Save security scan if available
    if (pipelineResult.config?.steps) {
      const securityStep = pipelineResult.config.steps.find((s: any) => s.id === 'security_scan')
      if (securityStep?.results) {
        await supabase.from('security_scans').insert({
          project_id: projectId,
          name: 'Auto-Pipeline Security Scan',
          status: securityStep.status || 'completed',
          vulnerabilities: securityStep.results.vulnerabilities || [],
          summary: securityStep.results.summary || {}
        })
      }
    }

    // Save model adapter if available
    if (pipelineResult.config?.steps && optimizedPrompt) {
      const adapterStep = pipelineResult.config.steps.find((s: any) => s.id === 'model_adapter')
      if (adapterStep?.results) {
        await supabase.from('model_adapters').insert({
          project_id: projectId,
          provider: pipelineResult.config.targetProvider || 'groq',
          model: pipelineResult.config.targetModel || 'llama-3.1-8b-instant',
          original_prompt: originalPrompt,
          adapted_prompt: optimizedPrompt,
          changes: adapterStep.results.changes || [],
          analysis: adapterStep.results.analysis || {}
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      projectId: project.id,
      message: 'Pipeline results saved successfully' 
    })

  } catch (error) {
    console.error('Save pipeline error:', error)
    return NextResponse.json({ 
      error: 'Failed to save pipeline results',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
