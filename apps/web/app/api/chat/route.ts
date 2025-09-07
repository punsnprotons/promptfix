import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'
import OpenAI from 'openai'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, provider = 'groq', model = 'llama-3.1-8b-instant' } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    let response
    let content = ''

    if (provider === 'groq') {
      try {
        const completion = await groq.chat.completions.create({
          messages: messages,
          model: model,
          temperature: 0.7,
          max_tokens: 1000,
        })

        content = completion.choices[0]?.message?.content || 'No response generated'
      } catch (groqError: any) {
        console.error('Groq API error:', groqError)
        if (groqError.status === 429) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please try again in a moment.' 
          }, { status: 429 })
        }
        throw groqError
      }
    } else if (provider === 'openai') {
      try {
        const completion = await openai.chat.completions.create({
          messages: messages,
          model: model,
          temperature: 0.7,
          max_tokens: 1000,
        })

        content = completion.choices[0]?.message?.content || 'No response generated'
      } catch (openaiError: any) {
        console.error('OpenAI API error:', openaiError)
        if (openaiError.status === 429) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please try again in a moment.' 
          }, { status: 429 })
        }
        throw openaiError
      }
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    return NextResponse.json({ 
      content,
      provider,
      model,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
