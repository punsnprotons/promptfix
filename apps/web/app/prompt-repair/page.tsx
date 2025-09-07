'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Zap,
  Eye,
  RefreshCw,
  TrendingUp,
  Settings,
  ArrowRight,
  Copy,
  Download
} from 'lucide-react'

interface RepairSuggestion {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  originalText: string
  suggestedText: string
  reasoning: string
  confidence: number
  impact: string
  examples?: Array<{
    before: string
    after: string
    explanation: string
  }>
}

interface PromptRepairRun {
  id: string
  originalPrompt: string
  suggestions: RepairSuggestion[]
  summary: {
    totalSuggestions: number
    criticalSuggestions: number
    highSuggestions: number
    mediumSuggestions: number
    lowSuggestions: number
    averageConfidence: number
  }
  repairedPrompt?: string
  startedAt: string
  finishedAt?: string
  cost: number
  tokens: number
}

export default function PromptRepair() {
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

  const [selectedFocusAreas, setSelectedFocusAreas] = useState(['clarity', 'safety', 'performance', 'consistency'])
  const [includeExamples, setIncludeExamples] = useState(true)
  const [maxSuggestions, setMaxSuggestions] = useState(10)
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRepairing, setIsRepairing] = useState(false)
  const [result, setResult] = useState<PromptRepairRun | null>(null)
  const [repairedPrompt, setRepairedPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<RepairSuggestion | null>(null)

  const focusAreas = [
    { id: 'clarity', name: 'Clarity', description: 'Improve readability and understandability' },
    { id: 'safety', name: 'Safety', description: 'Enhance safety and ethical considerations' },
    { id: 'performance', name: 'Performance', description: 'Optimize for better performance' },
    { id: 'consistency', name: 'Consistency', description: 'Improve reliability and predictability' },
    { id: 'completeness', name: 'Completeness', description: 'Ensure thoroughness and coverage' },
    { id: 'efficiency', name: 'Efficiency', description: 'Optimize for token usage and speed' }
  ]

  const analyzePrompt = async () => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/prompt-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          prompt: originalPrompt,
          focusAreas: selectedFocusAreas,
          includeExamples,
          maxSuggestions
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const repairPrompt = async () => {
    if (!result || !result.suggestions.length) return

    setIsRepairing(true)
    setError(null)

    try {
      const response = await fetch('/api/prompt-repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'repair',
          originalPrompt,
          suggestions: result.suggestions,
          applyAll: false,
          severityThreshold: 'medium',
          confidenceThreshold: 0.6
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Repair failed')
      }

      setRepairedPrompt(data.data.repairedPrompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsRepairing(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Wrench className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    
    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Prompt Repair Engine</h1>
        <p className="text-gray-600">AI-powered analysis and repair suggestions for your system prompts</p>
      </div>

      {/* Input Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Prompt Analysis Configuration
          </CardTitle>
          <CardDescription>
            Configure the analysis parameters and focus areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">System Prompt</label>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              className="w-full h-40 p-3 border rounded-md resize-none font-mono text-sm"
              placeholder="Enter your system prompt to analyze..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Focus Areas</label>
            <div className="grid md:grid-cols-3 gap-2">
              {focusAreas.map(area => (
                <label key={area.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedFocusAreas.includes(area.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFocusAreas([...selectedFocusAreas, area.id])
                      } else {
                        setSelectedFocusAreas(selectedFocusAreas.filter(id => id !== area.id))
                      }
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{area.name}</div>
                    <div className="text-xs text-gray-600">{area.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Suggestions</label>
              <input
                type="number"
                value={maxSuggestions}
                onChange={(e) => setMaxSuggestions(parseInt(e.target.value) || 10)}
                className="w-full p-2 border rounded-md"
                min="1"
                max="20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
              />
              <span className="text-sm">Include examples in suggestions</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={analyzePrompt} 
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Prompt...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  Analyze Prompt
                </>
              )}
            </Button>
            
            {result && result.suggestions.length > 0 && (
              <Button 
                onClick={repairPrompt} 
                disabled={isRepairing}
                variant="outline"
              >
                {isRepairing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Repairing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Generate Repair
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
              <XCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Analysis Summary
              </CardTitle>
              <CardDescription>Run ID: {result.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.totalSuggestions}</div>
                  <div className="text-sm text-gray-600">Total Suggestions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.summary.criticalSuggestions}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{result.summary.highSuggestions}</div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(result.summary.averageConfidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{result.summary.mediumSuggestions}</div>
                  <div className="text-sm text-gray-600">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{result.summary.lowSuggestions}</div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Repair Suggestions ({result.suggestions.length})</h2>
            
            {result.suggestions.map((suggestion, index) => (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(suggestion.severity)}
                      <div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        <CardDescription>
                          {suggestion.type} • {(suggestion.confidence * 100).toFixed(1)}% confidence
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(suggestion.severity)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Description:</div>
                      <div className="text-sm text-gray-600">{suggestion.description}</div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium mb-1">Original:</div>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm font-mono">
                          {suggestion.originalText}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Suggested:</div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm font-mono">
                          {suggestion.suggestedText}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-1">Reasoning:</div>
                      <div className="text-sm text-gray-600">{suggestion.reasoning}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-1">Expected Impact:</div>
                      <div className="text-sm text-gray-600">{suggestion.impact}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Repaired Prompt */}
      {repairedPrompt && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Repaired Prompt
            </CardTitle>
            <CardDescription className="text-green-700">
              AI-generated improved version of your prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white border border-green-200 rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-mono">{repairedPrompt}</pre>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(repairedPrompt)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Repaired Prompt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOriginalPrompt(repairedPrompt)}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Use as New Prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestion Detail Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(selectedSuggestion.severity)}
                  <CardTitle>{selectedSuggestion.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {getSeverityBadge(selectedSuggestion.severity)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSuggestion(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Suggestion Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {selectedSuggestion.type}</div>
                  <div><strong>Severity:</strong> {selectedSuggestion.severity}</div>
                  <div><strong>Confidence:</strong> {(selectedSuggestion.confidence * 100).toFixed(1)}%</div>
                  <div><strong>Impact:</strong> {selectedSuggestion.impact}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <div className="p-3 bg-gray-50 rounded">
                  {selectedSuggestion.description}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Change Comparison</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Original:</div>
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-sm font-mono">
                      {selectedSuggestion.originalText}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Suggested:</div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm font-mono">
                      {selectedSuggestion.suggestedText}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Reasoning</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  {selectedSuggestion.reasoning}
                </div>
              </div>

              {selectedSuggestion.examples && selectedSuggestion.examples.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Examples</h4>
                  <div className="space-y-2">
                    {selectedSuggestion.examples.map((example, idx) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="grid md:grid-cols-2 gap-2 mb-2">
                          <div>
                            <div className="text-sm font-medium text-red-600">Before:</div>
                            <div className="text-sm">{example.before}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-green-600">After:</div>
                            <div className="text-sm">{example.after}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 italic">{example.explanation}</div>
                      </div>
                    ))}
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
