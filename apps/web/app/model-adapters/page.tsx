'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  ArrowRight, 
  Copy, 
  Download,
  Zap,
  Brain,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  RefreshCw,
  Eye,
  TrendingUp
} from 'lucide-react'

interface PromptAdapter {
  id: string
  provider: string
  model: string
  adapterType: 'optimization' | 'safety' | 'performance' | 'compatibility'
  originalPrompt: string
  adaptedPrompt: string
  changes: Array<{
    type: string
    description: string
    original: string
    adapted: string
  }>
  performanceMetrics?: {
    tokenEfficiency: number
    responseQuality: number
    safetyScore: number
    consistencyScore: number
  }
  createdAt: string
}

export default function ModelAdapters() {
  const [originalPrompt, setOriginalPrompt] = useState(`You are a helpful customer support assistant for an e-commerce platform. Your role is to:

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

  const [selectedProvider, setSelectedProvider] = useState('groq')
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant')
  const [isCreating, setIsCreating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [adapter, setAdapter] = useState<PromptAdapter | null>(null)
  const [error, setError] = useState<string | null>(null)

  const providers = [
    { 
      id: 'groq', 
      name: 'Groq', 
      icon: <Zap className="h-5 w-5 text-green-600" />,
      models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile'],
      description: 'Fast inference with optimized models'
    },
    { 
      id: 'openai', 
      name: 'OpenAI', 
      icon: <Brain className="h-5 w-5 text-blue-600" />,
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      description: 'High-quality responses with advanced reasoning'
    },
    { 
      id: 'anthropic', 
      name: 'Anthropic', 
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      models: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'],
      description: 'Advanced reasoning with safety focus'
    }
  ]

  const createAdapter = async () => {
    setIsCreating(true)
    setError(null)
    setAdapter(null)

    try {
      const response = await fetch('/api/prompt-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-adapter',
          originalPrompt,
          targetProvider: selectedProvider,
          targetModel: selectedModel
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Adapter creation failed')
      }

      setAdapter(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsCreating(false)
    }
  }

  const testAdapter = async () => {
    if (!adapter) return

    setIsTesting(true)
    setError(null)

    try {
      const response = await fetch('/api/prompt-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-adapter',
          adapter
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Adapter testing failed')
      }

      setAdapter(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getProviderIcon = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.icon || <Settings className="h-5 w-5" />
  }

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.name || providerId
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Model-Specific Adapters</h1>
        <p className="text-gray-600">Create optimized prompts for different LLM providers and models</p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Adapter Configuration
          </CardTitle>
          <CardDescription>
            Configure the target provider and model for optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Original Prompt</label>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              className="w-full h-40 p-3 border rounded-md resize-none font-mono text-sm"
              placeholder="Enter your system prompt to adapt..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Provider</label>
              <div className="space-y-2">
                {providers.map(provider => (
                  <label key={provider.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      value={provider.id}
                      checked={selectedProvider === provider.id}
                      onChange={(e) => {
                        setSelectedProvider(e.target.value)
                        // Auto-select first model for the provider
                        setSelectedModel(provider.models[0])
                      }}
                    />
                    <div className="flex items-center space-x-2">
                      {provider.icon}
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-600">{provider.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Model</label>
              <div className="space-y-2">
                {providers.find(p => p.id === selectedProvider)?.models.map(model => (
                  <label key={model} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="model"
                      value={model}
                      checked={selectedModel === model}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    />
                    <span className="font-mono text-sm">{model}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={createAdapter} 
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Adapter...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Create Adapter
                </>
              )}
            </Button>
            
            {adapter && (
              <Button 
                onClick={testAdapter} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Test Performance
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Operation Failed</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Adapter Results */}
      {adapter && (
        <div className="space-y-6">
          {/* Adapter Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getProviderIcon(adapter.provider)}
                <span className="ml-2">
                  {getProviderName(adapter.provider)} Adapter
                </span>
              </CardTitle>
              <CardDescription>
                Model: {adapter.model} • Created: {new Date(adapter.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Original Prompt</h4>
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{adapter.originalPrompt}</pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Adapted Prompt</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{adapter.adaptedPrompt}</pre>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(adapter.adaptedPrompt)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Adapted Prompt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOriginalPrompt(adapter.adaptedPrompt)}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Use as New Prompt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Changes Made */}
          <Card>
            <CardHeader>
              <CardTitle>Changes Made</CardTitle>
              <CardDescription>
                Detailed breakdown of optimizations applied for {adapter.provider}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adapter.changes.map((change, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{change.type}</Badge>
                        <span className="font-medium">{change.description}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium mb-1 text-red-600">Original:</div>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm font-mono">
                          {change.original}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1 text-green-600">Adapted:</div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm font-mono">
                          {change.adapted}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {adapter.performanceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Estimated performance improvements for this adapter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(adapter.performanceMetrics.tokenEfficiency * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Token Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(adapter.performanceMetrics.responseQuality * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Response Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(adapter.performanceMetrics.safetyScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Safety Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(adapter.performanceMetrics.consistencyScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Migration Workflow */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <ArrowRight className="h-5 w-5 mr-2" />
                Migration Workflow
              </CardTitle>
              <CardDescription className="text-blue-700">
                Steps to migrate from your current prompt to this optimized version
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="text-sm">
                    <strong>Test the adapted prompt</strong> in a development environment
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="text-sm">
                    <strong>Run evaluations</strong> to compare performance with the original
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="text-sm">
                    <strong>Deploy gradually</strong> using A/B testing or canary deployment
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div className="text-sm">
                    <strong>Monitor performance</strong> and rollback if needed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
