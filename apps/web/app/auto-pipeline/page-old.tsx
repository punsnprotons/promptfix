'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Navigation } from '@/components/Navigation'
import { 
  Play, 
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
  Download,
  AlertTriangle,
  BarChart3,
  Shield,
  Wrench,
  Target
} from 'lucide-react'

interface PipelineStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt?: string
  finishedAt?: string
  duration?: number
  results?: any
  error?: string
  cost?: number
  tokens?: number
}

interface PipelineResult {
  config: {
    id: string
    name: string
    description: string
    steps: PipelineStep[]
    originalPrompt: string
    targetProvider?: string
    targetModel?: string
    options: any
    status: string
    startedAt: string
    finishedAt?: string
    totalCost: number
    totalTokens: number
    summary: {
      totalSteps: number
      completedSteps: number
      failedSteps: number
      skippedSteps: number
      averageScore?: number
      criticalIssues?: number
      suggestions?: number
    }
  }
  finalPrompt?: string
  recommendations: string[]
  nextSteps: string[]
  qualityScore: number
  confidenceLevel: 'low' | 'medium' | 'high'
}

export default function AutoPipeline() {
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

  // Load prompt from localStorage on component mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem('pendingPrompt')
    if (savedPrompt) {
      setOriginalPrompt(savedPrompt)
      localStorage.removeItem('pendingPrompt') // Clear after loading
    }
  }, [])

  const [targetProvider, setTargetProvider] = useState('groq')
  const [targetModel, setTargetModel] = useState('llama-3.1-8b-instant')
  
  const [generateScenarios, setGenerateScenarios] = useState(true)
  const [runEvaluation, setRunEvaluation] = useState(true)
  const [securityScan, setSecurityScan] = useState(true)
  const [promptRepair, setPromptRepair] = useState(true)
  const [createAdapter, setCreateAdapter] = useState(true)
  
  const [scenarioCount, setScenarioCount] = useState(10)
  const [evaluationProviders, setEvaluationProviders] = useState(['groq'])
  const [repairFocusAreas, setRepairFocusAreas] = useState(['clarity', 'safety', 'performance'])
  const [securityAttackTypes, setSecurityAttackTypes] = useState(['prompt_injection', 'data_exfiltration'])
  
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const providers = [
    { id: 'groq', name: 'Groq', models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile'] },
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'] }
  ]

  const focusAreas = [
    { id: 'clarity', name: 'Clarity', description: 'Improve readability and understandability' },
    { id: 'safety', name: 'Safety', description: 'Enhance safety and ethical considerations' },
    { id: 'performance', name: 'Performance', description: 'Optimize for better performance' },
    { id: 'consistency', name: 'Consistency', description: 'Improve reliability and predictability' },
    { id: 'completeness', name: 'Completeness', description: 'Ensure thoroughness and coverage' },
    { id: 'efficiency', name: 'Efficiency', description: 'Optimize for token usage and speed' }
  ]

  const attackTypes = [
    { id: 'prompt_injection', name: 'Prompt Injection', description: 'Test for prompt injection vulnerabilities' },
    { id: 'data_exfiltration', name: 'Data Exfiltration', description: 'Test for data leakage' },
    { id: 'role_confusion', name: 'Role Confusion', description: 'Test for role manipulation' },
    { id: 'jailbreak', name: 'Jailbreak', description: 'Test for safety guardrail bypass' }
  ]

  const runPipeline = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      // Create initial result structure
      const initialResult = {
        config: {
          id: `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'Auto Pipeline Analysis',
          description: 'Comprehensive analysis and optimization of system prompt',
          steps: [
            { id: 'scenario_generation', name: 'Scenario Generation', description: 'Generate diverse test scenarios for comprehensive coverage', status: 'pending' },
            { id: 'evaluation', name: 'LLM Evaluation', description: 'Test prompt across multiple LLM providers', status: 'pending' },
            { id: 'security_scan', name: 'Security Scan', description: 'Red-team testing for vulnerabilities', status: 'pending' },
            { id: 'prompt_repair', name: 'Prompt Repair', description: 'AI-powered analysis and improvement suggestions', status: 'pending' },
            { id: 'model_adapter', name: 'Model Adapter', description: 'Create provider-specific optimizations', status: 'pending' },
          ],
          originalPrompt,
          targetProvider,
          targetModel,
          status: 'running',
          startedAt: new Date().toISOString(),
          totalCost: 0,
          totalTokens: 0,
          summary: {
            totalSteps: 5,
            completedSteps: 0,
            failedSteps: 0,
            skippedSteps: 0,
            averageScore: 0,
            criticalIssues: 0,
            suggestions: 0,
          }
        },
        finalPrompt: originalPrompt,
        recommendations: [],
        nextSteps: [],
        qualityScore: 0,
        confidenceLevel: 'low' as const
      }
      
      setResult(initialResult)

      // Run each step individually and update results in real-time
      const steps = [
        { id: 'scenario_generation', enabled: generateScenarios },
        { id: 'evaluation', enabled: runEvaluation },
        { id: 'security_scan', enabled: securityScan },
        { id: 'prompt_repair', enabled: promptRepair },
        { id: 'model_adapter', enabled: createAdapter }
      ]

      let currentPrompt = originalPrompt
      let totalCost = 0
      let totalTokens = 0
      let completedSteps = 0
      let failedSteps = 0
      let skippedSteps = 0

      for (const step of steps) {
        if (!step.enabled) {
          // Mark as skipped
          setResult(prev => {
            if (!prev) return prev
            const updatedSteps = prev.config.steps.map(s => 
              s.id === step.id ? { ...s, status: 'skipped' as const } : s
            )
            return {
              ...prev,
              config: {
                ...prev.config,
                steps: updatedSteps,
                summary: {
                  ...prev.config.summary,
                  skippedSteps: skippedSteps + 1
                }
              }
            }
          })
          skippedSteps++
          continue
        }

        // Mark step as running
        setResult(prev => {
          if (!prev) return prev
          const updatedSteps = prev.config.steps.map(s => 
            s.id === step.id ? { ...s, status: 'running' as const, startedAt: new Date().toISOString() } : s
          )
          return {
            ...prev,
            config: {
              ...prev.config,
              steps: updatedSteps
            }
          }
        })

        try {
          // Run individual step
          const stepResponse = await fetch('/api/auto-pipeline', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'run-pipeline',
              originalPrompt: currentPrompt,
              targetProvider,
              targetModel,
              generateScenarios: step.id === 'scenario_generation',
              runEvaluation: step.id === 'evaluation',
              securityScan: step.id === 'security_scan',
              promptRepair: step.id === 'prompt_repair',
              createAdapter: step.id === 'model_adapter',
              scenarioCount,
              evaluationProviders,
              repairFocusAreas,
              securityAttackTypes
            }),
          })

          const stepData = await stepResponse.json()

          if (!stepResponse.ok) {
            throw new Error(stepData.error || `Step ${step.id} failed`)
          }

          // Update result with step completion
          const stepResult = stepData.data
          const stepConfig = stepResult.config
          const completedStep = stepConfig.steps.find(s => s.status === 'completed')
          
          if (completedStep) {
            totalCost += completedStep.cost || 0
            totalTokens += completedStep.tokens || 0
            
            // Update current prompt if it was modified
            if (stepResult.finalPrompt && stepResult.finalPrompt !== currentPrompt) {
              currentPrompt = stepResult.finalPrompt
            }

            setResult(prev => {
              if (!prev) return prev
              const updatedSteps = prev.config.steps.map(s => 
                s.id === step.id ? { 
                  ...s, 
                  status: 'completed' as const, 
                  finishedAt: new Date().toISOString(),
                  duration: completedStep.duration,
                  results: completedStep.results,
                  cost: completedStep.cost,
                  tokens: completedStep.tokens
                } : s
              )
              
              return {
                ...prev,
                config: {
                  ...prev.config,
                  steps: updatedSteps,
                  totalCost: totalCost,
                  totalTokens: totalTokens,
                  summary: {
                    ...prev.config.summary,
                    completedSteps: completedSteps + 1
                  }
                },
                finalPrompt: currentPrompt,
                recommendations: [...prev.recommendations, ...(stepResult.recommendations || [])]
              }
            })
            
            completedSteps++
          }
        } catch (stepError) {
          // Mark step as failed
          setResult(prev => {
            if (!prev) return prev
            const updatedSteps = prev.config.steps.map(s => 
              s.id === step.id ? { 
                ...s, 
                status: 'failed' as const, 
                finishedAt: new Date().toISOString(),
                error: stepError instanceof Error ? stepError.message : 'Unknown error'
              } : s
            )
            return {
              ...prev,
              config: {
                ...prev.config,
                steps: updatedSteps,
                summary: {
                  ...prev.config.summary,
                  failedSteps: failedSteps + 1
                }
              }
            }
          })
          failedSteps++
        }
      }

      // Mark pipeline as completed
      setResult(prev => {
        if (!prev) return prev
        return {
          ...prev,
          config: {
            ...prev.config,
            status: failedSteps > 0 ? 'completed_with_errors' : 'completed',
            finishedAt: new Date().toISOString(),
            summary: {
              ...prev.config.summary,
              completedSteps,
              failedSteps,
              skippedSteps
            }
          }
        }
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  // Auto-start pipeline if coming from homepage
  useEffect(() => {
    const savedPrompt = localStorage.getItem('pendingPrompt')
    if (savedPrompt) {
      // Auto-start the pipeline with default settings
      setTimeout(() => {
        runPipeline()
      }, 1000) // Small delay to ensure component is fully loaded
    }
  }, [])

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'skipped':
        return <Eye className="h-5 w-5 text-gray-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      skipped: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getConfidenceBadge = (level: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {level.toUpperCase()} CONFIDENCE
      </Badge>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-white">Auto Pipeline Mode</h1>
          <p className="text-gray-300">Comprehensive automated analysis and optimization workflow</p>
        </div>

        {/* Pipeline Configuration */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Settings className="h-5 w-5 mr-2 text-orange-500" />
              Pipeline Configuration
            </CardTitle>
            <CardDescription className="text-gray-300">
              Configure the automated workflow for comprehensive prompt analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Original Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">System Prompt</label>
              <Textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                className="w-full h-40 p-3 border-gray-700 bg-black text-white placeholder-gray-400 resize-none font-mono text-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter your system prompt for comprehensive analysis..."
              />
            </div>

            {/* Target Provider and Model */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Target Provider</label>
                <div className="space-y-2">
                  {providers.map(provider => (
                    <label key={provider.id} className="flex items-center space-x-3 p-3 border border-gray-700 rounded hover:bg-gray-800 cursor-pointer bg-gray-800">
                      <input
                        type="radio"
                        name="provider"
                        value={provider.id}
                        checked={targetProvider === provider.id}
                        onChange={(e) => {
                          setTargetProvider(e.target.value)
                          setTargetModel(provider.models[0])
                        }}
                        className="text-orange-500"
                      />
                      <div>
                        <div className="font-medium text-white">{provider.name}</div>
                        <div className="text-sm text-gray-400">{provider.models.join(', ')}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Target Model</label>
                <div className="space-y-2">
                  {providers.find(p => p.id === targetProvider)?.models.map(model => (
                    <label key={model} className="flex items-center space-x-2 p-2 border border-gray-700 rounded hover:bg-gray-800 cursor-pointer bg-gray-800">
                      <input
                        type="radio"
                        name="model"
                        value={model}
                        checked={targetModel === model}
                        onChange={(e) => setTargetModel(e.target.value)}
                        className="text-orange-500"
                      />
                      <span className="font-mono text-sm text-white">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pipeline Steps */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Pipeline Steps</label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={generateScenarios}
                      onChange={(e) => setGenerateScenarios(e.target.checked)}
                      className="text-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span>Generate Scenarios</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={runEvaluation}
                      onChange={(e) => setRunEvaluation(e.target.checked)}
                      className="text-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <span>Run Evaluation</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={securityScan}
                      onChange={(e) => setSecurityScan(e.target.checked)}
                      className="text-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span>Security Scan</span>
                    </div>
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={promptRepair}
                      onChange={(e) => setPromptRepair(e.target.checked)}
                      className="text-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-orange-500" />
                      <span>Prompt Repair</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={createAdapter}
                      onChange={(e) => setCreateAdapter(e.target.checked)}
                      className="text-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-orange-500" />
                      <span>Create Adapter</span>
                    </div>
                  </label>
                  <div className="flex items-center space-x-2 text-white">
                    <label className="text-sm">Scenario Count:</label>
                    <input
                      type="number"
                      value={scenarioCount}
                      onChange={(e) => setScenarioCount(parseInt(e.target.value) || 10)}
                      className="w-20 p-1 border border-gray-700 rounded text-sm bg-gray-800 text-white"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Run Pipeline Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={runPipeline}
                disabled={isRunning}
                className="bg-orange-500 hover:bg-orange-600 text-black px-8 py-3 text-lg"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Running Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Run Auto Pipeline
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium mb-2 text-white">Repair Focus Areas</div>
                <div className="space-y-1">
                  {focusAreas.map(area => (
                    <label key={area.id} className="flex items-center space-x-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={repairFocusAreas.includes(area.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRepairFocusAreas([...repairFocusAreas, area.id])
                          } else {
                            setRepairFocusAreas(repairFocusAreas.filter(id => id !== area.id))
                          }
                        }}
                        className="text-orange-500"
                      />
                      <span>{area.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2 text-white">Security Tests</div>
                <div className="space-y-1">
                  {attackTypes.map(attack => (
                    <label key={attack.id} className="flex items-center space-x-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={securityAttackTypes.includes(attack.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSecurityAttackTypes([...securityAttackTypes, attack.id])
                          } else {
                            setSecurityAttackTypes(securityAttackTypes.filter(id => id !== attack.id))
                          }
                        }}
                        className="text-orange-500"
                      />
                      <span>{attack.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2 text-white">Evaluation Providers</div>
                <div className="space-y-1">
                  {providers.map(provider => (
                    <label key={provider.id} className="flex items-center space-x-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={evaluationProviders.includes(provider.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEvaluationProviders([...evaluationProviders, provider.id])
                          } else {
                            setEvaluationProviders(evaluationProviders.filter(id => id !== provider.id))
                          }
                        }}
                        className="text-orange-500"
                      />
                      <span>{provider.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-500 bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-400">
                <XCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Pipeline Failed</span>
              </div>
              <p className="text-red-300 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Pipeline Results */}
        {result && (
          <div className="space-y-6">
            {/* Pipeline Summary */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                  Pipeline Results
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Pipeline ID: {result.config.id} • Quality Score: {result.qualityScore.toFixed(1)}/10
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{result.config.summary.completedSteps}</div>
                    <div className="text-sm text-gray-400">Completed Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{result.config.summary.failedSteps}</div>
                    <div className="text-sm text-gray-400">Failed Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{(result.config.totalCost || 0).toFixed(4)}</div>
                    <div className="text-sm text-gray-400">Total Cost ($)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{result.config.totalTokens || 0}</div>
                    <div className="text-sm text-gray-400">Total Tokens</div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-500">{result.qualityScore.toFixed(1)}/10</div>
                    <div className="text-sm text-gray-400">Quality Score</div>
                  </div>
                  <div className="text-center">
                    {getConfidenceBadge(result.confidenceLevel)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Pipeline Steps</CardTitle>
                <CardDescription className="text-gray-300">Detailed breakdown of each pipeline step</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.config.steps.map((step, index) => (
                    <div key={step.id} className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStepIcon(step.status)}
                          <div>
                            <div className="font-medium text-white">{step.name}</div>
                            <div className="text-sm text-gray-400">{step.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStepBadge(step.status)}
                          {step.duration && (
                            <span className="text-sm text-gray-400">
                              {(step.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {step.error && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-500 rounded text-sm text-red-300">
                          Error: {step.error}
                        </div>
                      )}
                      
                      {step.results && (
                        <div className="mt-2 text-sm text-gray-400">
                          {step.status === 'completed' && (
                            <div>
                              {step.id === 'scenario_generation' && `Generated ${step.results.length} scenarios`}
                              {step.id === 'evaluation' && `Average score: ${step.results.summary?.averageScore?.toFixed(1) || 'N/A'}/10`}
                              {step.id === 'security_scan' && `Found ${step.results.vulnerabilities?.length || 0} vulnerabilities`}
                              {step.id === 'prompt_repair' && `Generated ${step.results.suggestions?.length || 0} suggestions`}
                              {step.id === 'model_adapter' && `Created adapter for ${result.config.targetProvider}/${result.config.targetModel}`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Recommendations
                </CardTitle>
                <CardDescription className="text-gray-300">AI-generated recommendations based on analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            {result.nextSteps.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <ArrowRight className="h-5 w-5 mr-2 text-orange-500" />
                    Next Steps
                  </CardTitle>
                  <CardDescription className="text-gray-300">Recommended follow-up actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5" />
                        <span className="text-sm text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Prompt */}
            {result.finalPrompt && result.finalPrompt !== originalPrompt && (
              <Card className="border-orange-500 bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-500">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Optimized Prompt
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Final optimized version after pipeline processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-black border border-gray-700 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-white">{result.finalPrompt}</pre>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.finalPrompt!)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Optimized Prompt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOriginalPrompt(result.finalPrompt!)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Use as New Prompt
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/projects', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                name: `Optimized Prompt - ${new Date().toLocaleDateString()}`,
                                description: 'Auto-generated project from optimized prompt',
                                systemPrompt: result.finalPrompt
                              }),
                            })
                            
                            if (response.ok) {
                              alert('Project saved successfully!')
                              window.location.href = '/dashboard'
                            } else {
                              alert('Failed to save project')
                            }
                          } catch (error) {
                            alert('Error saving project')
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-black"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Save as Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}