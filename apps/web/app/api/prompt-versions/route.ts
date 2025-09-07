import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock prompt versions data
    const promptVersions = [
      {
        id: '1',
        name: 'Customer Support Assistant v1.2.0',
        content: `You are a helpful customer support assistant for an e-commerce platform. Your role is to:

1. Help customers with order inquiries, returns, and general questions
2. Provide accurate information about products and services
3. Escalate complex issues to human agents when necessary
4. Maintain a friendly and professional tone
5. Never provide personal information about other customers
6. Always verify customer identity before discussing order details

Guidelines:
- Be concise but thorough in your responses
- Ask clarifying questions when needed
- Provide step-by-step instructions for common tasks
- Apologize for any inconvenience caused
- Offer alternatives when possible`,
        metadata: { version: '1.2.0', tags: ['customer-support', 'e-commerce'] },
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
        projectId: '1',
        createdById: 'demo-user',
        adapters: [],
        _count: { scenarioSuites: 2 },
      },
      {
        id: '2',
        name: 'Code Review Bot v1.0.0',
        content: `You are an expert code reviewer specializing in software quality and best practices. Your role is to:

1. Analyze code for bugs, security issues, and performance problems
2. Suggest improvements for readability, maintainability, and efficiency
3. Ensure adherence to coding standards and best practices
4. Provide constructive feedback with specific examples
5. Focus on both functionality and code quality

Guidelines:
- Be specific and actionable in your feedback
- Explain the reasoning behind your suggestions
- Prioritize critical issues over minor style preferences
- Provide code examples when helpful
- Maintain a professional and constructive tone`,
        metadata: { version: '1.0.0', tags: ['code-review', 'development'] },
        createdAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z',
        projectId: '2',
        createdById: 'demo-user',
        adapters: [],
        _count: { scenarioSuites: 1 },
      },
    ]

    return NextResponse.json({ success: true, data: promptVersions })
  } catch (error) {
    console.error('Error fetching prompt versions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock prompt version creation
    const newPromptVersion = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name || 'New Prompt Version',
      content: body.content || 'Enter your system prompt here...',
      metadata: body.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: body.projectId || '1',
      createdById: 'demo-user',
      adapters: [],
    }

    return NextResponse.json({ success: true, data: newPromptVersion })
  } catch (error) {
    console.error('Error creating prompt version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}