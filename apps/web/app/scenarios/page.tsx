'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProviderSelector from '@/components/ProviderSelector'
import { 
  Play, 
  BarChart3, 
  Target, 
  Shield, 
  Zap, 
  RefreshCw, 
  Eye,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface Scenario {
  id: string
  type: string
  intent?: string
  inputs: {
    messages: Array<{
      role: string
      content: string
    }>
    context?: any
    metadata?: any
  }
  checks: {
    validators: Array<{
      type: string
      value: any
      description: string
      weight?: number
    }>
    passThreshold?: number
  }
  adversarial: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface CoverageMetrics {
  intentCoverage: number
  constraintCoverage: number
  failureCoverage: number
  diversityScore: number
  totalScenarios: number
  scenarioTypes: Record<string, number>
  tags: Record<string, number>
}

interface ScenarioSuite {
  id: string
  name: string
  version: string
  source: string
  scenarios: Scenario[]
  coverageSnapshot: {
    intentCoverage: number
    constraintCoverage: number
    failureCoverage: number
    diversityScore: number
  }
  createdAt: string
  updatedAt: string
}

export default function ScenarioGenerator() {
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

  const [count, setCount] = useState(10)
  const [selectedTypes, setSelectedTypes] = useState(['user_intent', 'constraint', 'adversarial', 'edge_case'])
  const [includeAdversarial, setIncludeAdversarial] = useState(true)
  const [diversityBoost, setDiversityBoost] = useState(true)
  const [selectedProviders, setSelectedProviders] = useState(['groq'])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [suite, setSuite] = useState<ScenarioSuite | null>(null)
  const [coverage, setCoverage] = useState<CoverageMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)

  const generateScenarios = async () => {
    setIsGenerating(true)
    setError(null)
    setSuite(null)
    setCoverage(null)

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          count,
          types: selectedTypes,
          includeAdversarial,
          diversityBoost
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Scenario generation failed')
      }

      setSuite(data.data.suite)
      setCoverage(data.data.coverage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_intent':
        return <Target className="h-4 w-4 text-blue-600" />
      case 'constraint':
        return <BarChart3 className="h-4 w-4 text-green-600" />
      case 'adversarial':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'edge_case':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Zap className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      user_intent: 'bg-blue-100 text-blue-800',
      constraint: 'bg-green-100 text-green-800',
      adversarial: 'bg-red-100 text-red-800',
      edge_case: 'bg-orange-100 text-orange-800'
    }
    
    return (
      <Badge variant="default" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ')}
      </Badge>
    )
  }

  const getCoverageColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Scenario Generator</h1>
        <p className="text-gray-600">Generate diverse test scenarios with coverage metrics and adaptive exploration</p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Configuration</CardTitle>
          <CardDescription>
            Configure scenario generation parameters
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Number of Scenarios</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                className="w-full p-2 border rounded-md"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Scenario Types</label>
              <div className="space-y-2">
                {['user_intent', 'constraint', 'adversarial', 'edge_case'].map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, type])
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type))
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeAdversarial}
                onChange={(e) => setIncludeAdversarial(e.target.checked)}
              />
              <span className="text-sm">Include Adversarial Scenarios</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={diversityBoost}
                onChange={(e) => setDiversityBoost(e.target.checked)}
              />
              <span className="text-sm">Diversity Boost</span>
            </label>
          </div>

          <Button 
            onClick={generateScenarios} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Scenarios...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Scenarios
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
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Generation Failed</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Coverage Metrics */}
      {coverage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Coverage Metrics
            </CardTitle>
            <CardDescription>
              Scenario coverage analysis and diversity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCoverageColor(coverage.intentCoverage)}`}>
                  {coverage.intentCoverage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Intent Coverage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCoverageColor(coverage.constraintCoverage)}`}>
                  {coverage.constraintCoverage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Constraint Coverage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCoverageColor(coverage.failureCoverage)}`}>
                  {coverage.failureCoverage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Failure Coverage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCoverageColor(coverage.diversityScore)}`}>
                  {coverage.diversityScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Diversity Score</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Scenario Types</h4>
                <div className="space-y-1">
                  {Object.entries(coverage.scenarioTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Top Tags</h4>
                <div className="space-y-1">
                  {Object.entries(coverage.tags)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex justify-between text-sm">
                        <span>{tag}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Scenarios */}
      {suite && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Generated Scenarios ({suite.scenarios.length})</h2>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {suite.source}
            </Badge>
          </div>

          <div className="grid gap-4">
            {suite.scenarios.map((scenario, index) => (
              <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(scenario.type)}
                      <div>
                        <CardTitle className="text-lg">
                          {scenario.intent || `Scenario ${index + 1}`}
                        </CardTitle>
                        <CardDescription>
                          {scenario.tags.join(', ')} • {scenario.checks.validators.length} validators
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(scenario.type)}
                      {scenario.adversarial && (
                        <Badge variant="destructive">Adversarial</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedScenario(scenario)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium mb-1">User Message:</div>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        {scenario.inputs.messages[0]?.content || 'No message'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Validators:</div>
                      <div className="flex flex-wrap gap-1">
                        {scenario.checks.validators.map((validator, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {validator.type}: {validator.description}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedScenario.intent}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScenario(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Scenario Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {selectedScenario.type}</div>
                  <div><strong>Adversarial:</strong> {selectedScenario.adversarial ? 'Yes' : 'No'}</div>
                  <div><strong>Tags:</strong> {selectedScenario.tags.join(', ')}</div>
                  <div><strong>Created:</strong> {new Date(selectedScenario.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">User Message</h4>
                <div className="p-3 bg-gray-50 rounded">
                  {selectedScenario.inputs.messages[0]?.content}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Validation Checks</h4>
                <div className="space-y-2">
                  {selectedScenario.checks.validators.map((validator, idx) => (
                    <div key={idx} className="p-2 border rounded">
                      <div className="font-medium">{validator.type}</div>
                      <div className="text-sm text-gray-600">{validator.description}</div>
                      <div className="text-xs text-gray-500">Value: {JSON.stringify(validator.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedScenario.inputs.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Metadata</h4>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <pre>{JSON.stringify(selectedScenario.inputs.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
