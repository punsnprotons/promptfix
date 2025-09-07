import { NextRequest, NextResponse } from 'next/server'
import { createProject, getProjects } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, systemPrompt } = body

    if (!name || !systemPrompt) {
      return NextResponse.json(
        { success: false, error: 'Name and system prompt are required' },
        { status: 400 }
      )
    }

    const project = await createProject({
      name,
      description: description || null,
      system_prompt: systemPrompt,
      user_id: session.user.id
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}