import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Verify project belongs to user
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 })
    }

    // Get recent activity from all related tables
    const activities = []

    // Get pipeline runs
    const { data: pipelineRuns } = await supabase
      .from('pipeline_runs')
      .select('id, name, status, created_at, summary, config')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (pipelineRuns) {
      activities.push(...pipelineRuns.map(run => ({
        id: run.id,
        name: run.name || 'Auto-Pipeline Run',
        type: 'pipeline',
        status: run.status || 'completed',
        created_at: run.created_at,
        summary: run.summary ? 
          `${run.summary.completedSteps}/${run.summary.totalSteps} steps completed, $${(run.summary.totalCost || 0).toFixed(4)} cost` :
          'Pipeline completed',
        details: run.config // Store full pipeline config for detailed view
      })))
    }

    // Get evaluation runs
    const { data: evaluations } = await supabase
      .from('evaluation_runs')
      .select('id, name, status, created_at, total_cost, results')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (evaluations) {
      activities.push(...evaluations.map(evaluation => ({
        id: evaluation.id,
        name: evaluation.name || 'Evaluation Run',
        type: 'evaluation',
        status: evaluation.status || 'completed',
        created_at: evaluation.created_at,
        summary: evaluation.results?.summary ? 
          `${evaluation.results.summary.totalRuns} runs, ${Math.round(evaluation.results.summary.passRate)}% pass rate` :
          'Evaluation completed'
      })))
    }

    // Get security scans
    const { data: securityScans } = await supabase
      .from('security_scans')
      .select('id, name, status, created_at, vulnerabilities')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (securityScans) {
      activities.push(...securityScans.map(scan => ({
        id: scan.id,
        name: scan.name || 'Security Scan',
        type: 'security',
        status: scan.status || 'completed',
        created_at: scan.created_at,
        summary: scan.vulnerabilities ? 
          `${scan.vulnerabilities.length} vulnerabilities found` :
          'Security scan completed'
      })))
    }

    // Get scenario suites
    const { data: scenarioSuites } = await supabase
      .from('scenario_suites')
      .select('id, name, created_at, scenarios')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (scenarioSuites) {
      activities.push(...scenarioSuites.map(suite => ({
        id: suite.id,
        name: suite.name || 'Scenario Generation',
        type: 'scenarios',
        status: 'completed',
        created_at: suite.created_at,
        summary: suite.scenarios ? 
          `${Array.isArray(suite.scenarios) ? suite.scenarios.length : 0} scenarios generated` :
          'Scenarios generated'
      })))
    }

    // Get model adapters
    const { data: modelAdapters } = await supabase
      .from('model_adapters')
      .select('id, provider, model, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (modelAdapters) {
      activities.push(...modelAdapters.map(adapter => ({
        id: adapter.id,
        name: 'Model Adapter',
        type: 'adapter',
        status: 'completed',
        created_at: adapter.created_at,
        summary: `Optimized for ${adapter.provider}/${adapter.model}`
      })))
    }

    // Get prompt versions
    const { data: promptVersions } = await supabase
      .from('prompt_versions')
      .select('id, version_number, changes, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (promptVersions) {
      activities.push(...promptVersions.map(version => ({
        id: version.id,
        name: `Prompt Version ${version.version_number}`,
        type: 'prompt',
        status: 'completed',
        created_at: version.created_at,
        summary: version.changes || 'Prompt updated'
      })))
    }

    // Sort all activities by date and limit to 20
    const sortedActivities = activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

    return NextResponse.json(sortedActivities)

  } catch (error) {
    console.error('Get project activity error:', error)
    return NextResponse.json({ 
      error: 'Failed to get project activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
