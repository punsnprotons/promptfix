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

    // Get counts for each category
    const [promptVersions, evaluationRuns, securityScans, modelAdapters] = await Promise.all([
      supabase.from('prompt_versions').select('id', { count: 'exact' }).eq('project_id', projectId),
      supabase.from('evaluation_runs').select('id', { count: 'exact' }).eq('project_id', projectId),
      supabase.from('security_scans').select('id', { count: 'exact' }).eq('project_id', projectId),
      supabase.from('model_adapters').select('id', { count: 'exact' }).eq('project_id', projectId)
    ])

    const stats = {
      promptVersions: promptVersions.count || 0,
      evaluationRuns: evaluationRuns.count || 0,
      securityScans: securityScans.count || 0,
      modelAdapters: modelAdapters.count || 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Get project stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to get project stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
