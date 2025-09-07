import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock projects data
    const projects = [
      {
        id: '1',
        name: 'Customer Support Assistant',
        description: 'AI assistant for handling customer inquiries and support tickets',
        createdAt: '2024-01-15T10:00:00Z',
        _count: {
          promptVersions: 3,
          scenarioSuites: 2,
          evalRuns: 5,
        },
        promptVersions: [
          { id: '1', name: 'v1.2.0', createdAt: '2024-01-20T10:00:00Z' },
        ],
        evalRuns: [
          { id: '1', status: 'completed', finishedAt: '2024-01-20T11:00:00Z' },
        ],
      },
      {
        id: '2',
        name: 'Code Review Bot',
        description: 'Automated code review and suggestion system',
        createdAt: '2024-01-10T10:00:00Z',
        _count: {
          promptVersions: 2,
          scenarioSuites: 1,
          evalRuns: 3,
        },
        promptVersions: [
          { id: '2', name: 'v1.0.0', createdAt: '2024-01-12T10:00:00Z' },
        ],
        evalRuns: [
          { id: '2', status: 'running' },
        ],
      },
    ]

    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock project creation
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name || 'New Project',
      description: body.description || 'A new system prompt project',
      createdAt: new Date().toISOString(),
      organizationId: 'demo-org',
      createdById: 'demo-user',
    }

    return NextResponse.json({ success: true, data: newProject })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}