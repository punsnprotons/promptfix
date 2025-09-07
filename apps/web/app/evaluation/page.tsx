'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, XCircle, Clock, DollarSign, Zap } from 'lucide-react'
import ProviderSelector from '@/components/ProviderSelector'

interface EvaluationResult {
  provider: string
  model: string
  response: string
  scores: {
    overall: number
    instructionAdherence: number
    tone: number
    safety: number
    helpfulness: number
    reasoning: string
  }
  pass: boolean
  latency: number
  cost: number
  tokens: {
    prompt: number
    completion: number
    total: number
  }
}

interface EvaluationRun {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  results: EvaluationResult[]
  summary: {
    totalRuns: number
    passedRuns: number
    passRate: number
    averageScore: number
    totalCost: number
    totalLatency: number
  }
  startedAt: string
  finishedAt?: string
}

export default function EvaluationRunner() {
  const [systemPrompt, setSystemPrompt] = useState(`You are a helpful customer support assistant for an e-commerce platform. Your role is to:

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
- Offer alternatives when possible`)

  const [userMessage, setUserMessage] = useState('Hi, I placed an order #12345 last week and haven\'t received any updates. Can you check the status for me?')
  
  const [selectedProviders, setSelectedProviders] = useState(['groq'])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<EvaluationRun | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runEvaluation = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userMessage,
          providers: selectedProviders.map(provider => ({
            name: provider,
            model: provider === 'groq' ? 'llama-3.1-8b-instant' : 
                   provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet',
            apiKey: 'configured'
          }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Evaluation failed')
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Evaluation Engine</h1>
        <p className="text-gray-600">Test your system prompts across multiple LLM providers with LLM-as-judge scoring</p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Configuration</CardTitle>
          <CardDescription>
            Configure your system prompt and test message to run evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-32 p-3 border rounded-md resize-none"
              placeholder="Enter your system prompt..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Test Message</label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="w-full h-20 p-3 border rounded-md resize-none"
              placeholder="Enter the test message..."
            />
          </div>

          <Button 
            onClick={runEvaluation} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Running Evaluation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Evaluation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Provider Selection */}
      <ProviderSelector
        selectedProviders={selectedProviders}
        onProvidersChange={setSelectedProviders}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <XCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Evaluation Failed</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Evaluation Summary</CardTitle>
                  <CardDescription>Run ID: {result.id}</CardDescription>
                </div>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.totalRuns}</div>
                  <div className="text-sm text-gray-600">Total Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(result.summary.passRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.summary.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ${result.summary.totalCost.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Results */}
          <div className="grid gap-4">
            {result.results.map((evalResult, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {evalResult.provider} - {evalResult.model}
                      </CardTitle>
                      <CardDescription>
                        {evalResult.pass ? '✅ Passed' : '❌ Failed'} • 
                        {evalResult.latency}ms • 
                        ${evalResult.cost.toFixed(4)} • 
                        {evalResult.tokens.total} tokens
                      </CardDescription>
                    </div>
                    <Badge variant={evalResult.pass ? "default" : "destructive"}>
                      Score: {evalResult.scores.overall.toFixed(1)}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-medium">Overall</div>
                      <div className="text-lg font-bold">{evalResult.scores.overall.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Instructions</div>
                      <div className="text-lg font-bold">{evalResult.scores.instructionAdherence.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Tone</div>
                      <div className="text-lg font-bold">{evalResult.scores.tone.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Safety</div>
                      <div className="text-lg font-bold">{evalResult.scores.safety.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Helpfulness</div>
                      <div className="text-lg font-bold">{evalResult.scores.helpfulness.toFixed(1)}</div>
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <div className="text-sm font-medium mb-2">Response:</div>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {evalResult.response}
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <div className="text-sm font-medium mb-2">Scoring Reasoning:</div>
                    <div className="text-sm text-gray-600 italic">
                      {evalResult.scores.reasoning}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
