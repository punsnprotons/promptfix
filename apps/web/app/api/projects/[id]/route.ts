import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()
    const { system_prompt, name, description } = body

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

    // Update project
    const updates: any = {}
    if (system_prompt !== undefined) updates.system_prompt = system_prompt
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Project update error:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    // If system prompt was updated, create a new version
    if (system_prompt !== undefined) {
      // Get the current highest version number
      const { data: versions, error: versionError } = await supabase
        .from('prompt_versions')
        .select('version_number')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false })
        .limit(1)

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1

      await supabase.from('prompt_versions').insert({
        project_id: projectId,
        version_number: nextVersion,
        prompt_text: system_prompt,
        changes: 'Manual edit via project page',
        created_by: session.user.id
      })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ 
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
