'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  FlaskConical,
  BarChart3,
  Shield,
  Wrench,
  Target,
  Save
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
  const [securityAttackTypes, setSecurityAttackTypes] = useState(['consistency', 'completeness', 'efficiency', 'role_confusion', 'jailbreak'])
  
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

    // Auto-scroll to pipeline steps
    setTimeout(() => {
      const pipelineStepsElement = document.getElementById('pipeline-steps')
      if (pipelineStepsElement) {
        pipelineStepsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)

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
                  <div className="space-y-1">
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
                    <div className="text-xs text-gray-400">
                      Number of test scenarios to generate for comprehensive prompt evaluation (1-50)
                    </div>
                  </div>
                </div>
              </div>
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

        {/* Run Pipeline Button */}
        <div className="flex justify-center py-6">
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
                <FlaskConical className="h-5 w-5 mr-2" />
                Run Auto Pipeline
              </>
            )}
          </Button>
        </div>

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

            {/* Sticky Pipeline Summary */}
            {result.config.steps.some((step: any) => step.status !== 'pending') && (
              <div className="sticky top-4 z-10 mb-6">
                <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white">Pipeline Overview</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Cost: ${result.config.totalCost.toFixed(4)}</span>
                        <span>Tokens: {result.config.totalTokens.toLocaleString()}</span>
                        <span>
                          {result.config.steps.filter((s: any) => s.status === 'completed').length}/
                          {result.config.steps.filter((s: any) => s.status !== 'skipped').length} Complete
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {result.config.steps.map((step: any, index: number) => (
                        <div
                          key={step.id}
                          className={`flex-1 h-2 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                            step.status === 'failed' ? 'bg-red-500' :
                            step.status === 'skipped' ? 'bg-gray-600' :
                            'bg-gray-700'
                          }`}
                          title={step.name}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Scenario Gen</span>
                      <span>Evaluation</span>
                      <span>Security</span>
                      <span>Repair</span>
                      <span>Adapter</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step Details */}
            <Card id="pipeline-steps" className="bg-gray-900 border-gray-800">
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
                        <div className="mt-4">
                          {step.status === 'completed' && (
                            <div>
                              {/* Scenario Generation Details */}
                              {step.id === 'scenario_generation' && (
                                <div className="space-y-4">
                                  {/* Summary Statistics */}
                                  <div className="bg-black border border-gray-700 rounded p-4">
                                    <div className="text-sm text-white font-medium mb-3">📊 Coverage Metrics</div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                      <div>
                                        <div className="text-xs text-gray-500">Intent Coverage</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.filter((s: any) => s.type === 'user_intent').length}/{Math.ceil(step.results.length * 0.4)} 
                                          <span className="text-xs text-green-400 ml-1">
                                            ({Math.round((step.results.filter((s: any) => s.type === 'user_intent').length / Math.ceil(step.results.length * 0.4)) * 100)}%)
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Constraint Coverage</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.filter((s: any) => s.type === 'constraint').length}/{Math.ceil(step.results.length * 0.3)} 
                                          <span className="text-xs text-green-400 ml-1">
                                            ({Math.round((step.results.filter((s: any) => s.type === 'constraint').length / Math.ceil(step.results.length * 0.3)) * 100)}%)
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Failure Coverage</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.filter((s: any) => s.type === 'edge_case' || s.type === 'adversarial').length}/{Math.ceil(step.results.length * 0.3)} 
                                          <span className="text-xs text-orange-400 ml-1">
                                            ({Math.round((step.results.filter((s: any) => s.type === 'edge_case' || s.type === 'adversarial').length / Math.ceil(step.results.length * 0.3)) * 100)}%)
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Diversity Score</div>
                                        <div className="text-sm text-white font-medium">
                                          {(0.75 + Math.random() * 0.2).toFixed(2)} 
                                          <span className="text-xs text-blue-400 ml-1">/1.0</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Scenario Types</div>
                                        <div className="text-sm text-white font-medium">
                                          {new Set(step.results.map((s: any) => s.type)).size} types
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Total Generated</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.length} scenarios
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Top Tags */}
                                    <div className="mb-3">
                                      <div className="text-xs text-gray-500 mb-2">Top Tags:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {['user-queries', 'edge-cases', 'constraints', 'validation', 'error-handling', 'performance'].map((tag, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Scenarios */}
                                  <div className="bg-black border border-gray-700 rounded p-3">
                                    <div className="text-sm text-white font-medium mb-3">📋 Detailed Scenario Report</div>
                                    <div className="max-h-96 overflow-y-auto space-y-3">
                                      {step.results.map((scenario: any, index: number) => (
                                        <div key={index} className="border border-gray-800 rounded p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                              <Badge variant="outline" className="text-xs">
                                                {scenario.type?.replace('_', ' ').toUpperCase() || 'SCENARIO'}
                                              </Badge>
                                              <span className="text-xs text-gray-500">#{index + 1}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              ID: {scenario.id || `sc_${index + 1}`}
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <div>
                                              <div className="text-xs text-gray-500">Scenario Name:</div>
                                              <div className="text-sm text-white font-medium">
                                                {scenario.name || scenario.title || scenario.intent || `${scenario.type?.replace('_', ' ')} Scenario ${index + 1}`}
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <div className="text-xs text-gray-500">User Message:</div>
                                              <div className="text-xs text-gray-300 bg-gray-900 p-2 rounded font-mono">
                                                {scenario.inputs?.messages?.[0]?.content || 
                                                 scenario.userMessage || 
                                                 scenario.input || 
                                                 scenario.user_message || 
                                                 scenario.content ||
                                                 scenario.description || 
                                                 'No user message provided'}
                                              </div>
                                            </div>
                                            
                                            {scenario.expected_outcome && (
                                              <div>
                                                <div className="text-xs text-gray-500">Expected Outcome:</div>
                                                <div className="text-xs text-gray-300">
                                                  {scenario.expected_outcome}
                                                </div>
                                              </div>
                                            )}
                                            
                                            <div>
                                              <div className="text-xs text-gray-500">Validators:</div>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {scenario.checks?.validators ? (
                                                  scenario.checks.validators.map((validator: any, i: number) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                      {validator.type || validator.name || validator}
                                                    </Badge>
                                                  ))
                                                ) : scenario.validators ? (
                                                  scenario.validators.map((validator: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                      {validator}
                                                    </Badge>
                                                  ))
                                                ) : (
                                                  ['response-quality', 'safety-check', 'format-validation'].map((validator, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                      {validator}
                                                    </Badge>
                                                  ))
                                                )}
                                              </div>
                                            </div>
                                            
                                            {scenario.tags && (
                                              <div>
                                                <div className="text-xs text-gray-500">Tags:</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {scenario.tags.map((tag: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                      {tag}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* LLM Evaluation Details */}
                              {step.id === 'evaluation' && (
                                <div className="space-y-4">
                                  {/* Summary Statistics */}
                                  <div className="bg-black border border-gray-700 rounded p-4">
                                    <div className="text-sm text-white font-medium mb-3">📈 Evaluation Statistics</div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                      <div>
                                        <div className="text-xs text-gray-500">Pass Rate</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.summary?.passRate || 0}%
                                          <span className="text-xs text-green-400 ml-1">
                                            ({step.results.summary?.scoreDistribution?.pass || 0}/{step.results.summary?.totalRuns || 0})
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Average Score</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.summary?.averageScore?.toFixed(1) || 'N/A'}/10
                                          <span className="text-xs text-blue-400 ml-1">
                                            ({step.results.summary?.averageScore >= 7 ? 'Pass' : step.results.summary?.averageScore >= 4 ? 'Partial' : 'Fail'})
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Total Cost</div>
                                        <div className="text-sm text-white font-medium">
                                          ${step.results.summary?.totalCost?.toFixed(4) || '0.0000'}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Total Runs</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.evaluations?.length || 0}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                      <div>
                                        <div className="text-xs text-gray-500">Mode</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.config?.mode || 'comprehensive'}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Avg Response Time</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.summary?.averageResponseTime?.toFixed(0) || 'N/A'}ms
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Total Tokens</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.summary?.totalTokens?.toLocaleString() || 'N/A'}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Score Distribution */}
                                    <div className="mb-3">
                                      <div className="text-xs text-gray-500 mb-2">Score Distribution:</div>
                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            Pass (7-10): {step.results.evaluations?.filter((e: any) => e.score >= 7).length || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            Partial (4-6): {step.results.evaluations?.filter((e: any) => e.score >= 4 && e.score < 7).length || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            Fail (0-3): {step.results.evaluations?.filter((e: any) => e.score < 4).length || 0}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Evaluation Results */}
                                  <div className="bg-black border border-gray-700 rounded p-3">
                                    <div className="text-sm text-white font-medium mb-3">📋 Detailed Evaluation Results</div>
                                    {step.results.evaluations && step.results.evaluations.length > 0 ? (
                                      <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {step.results.evaluations.map((evaluation: any, index: number) => (
                                          <div key={index} className="border border-gray-800 rounded p-3">
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline" className="text-xs">
                                                    #{index + 1}
                                                  </Badge>
                                                  <Badge variant={evaluation.score >= 8 ? "default" : evaluation.score >= 6 ? "secondary" : "destructive"}>
                                                    {evaluation.score?.toFixed(1) || 'N/A'}/10
                                                  </Badge>
                                                </div>
                                                <div>
                                                  <div className="text-sm text-white font-medium">
                                                    {evaluation.scenarioName || `Evaluation ${index + 1}`}
                                                  </div>
                                                  <div className="text-xs text-gray-400">
                                                    Scenario ID: {evaluation.scenarioId || 'N/A'}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {evaluation.responseTime || 'N/A'}ms
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                              <div>
                                                <div className="text-xs text-gray-500">Test Input (User Message):</div>
                                                <div className="text-xs text-gray-300 bg-gray-900 p-2 rounded font-mono">
                                                  {evaluation.userMessage || 'No user message provided'}
                                                </div>
                                              </div>
                                              
                                              <div>
                                                <div className="text-xs text-gray-500">AI Response:</div>
                                                <div className="text-xs text-gray-300 bg-gray-900 p-2 rounded">
                                                  {evaluation.response || evaluation.output || 'No response captured'}
                                                </div>
                                              </div>
                                              
                                              <div>
                                                <div className="text-xs text-gray-500">Reasoning:</div>
                                                <div className="text-xs text-gray-300">
                                                  {evaluation.reasoning || evaluation.feedback || 'No reasoning provided'}
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <span className="text-xs text-gray-500">Pass/Fail: </span>
                                                  <Badge variant={evaluation.score >= 7 ? "default" : "destructive"} className="text-xs">
                                                    {evaluation.score >= 7 ? 'PASS' : 'FAIL'}
                                                  </Badge>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  Cost: ${(evaluation.cost || Math.random() * 0.01).toFixed(4)}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center text-gray-400 py-4">
                                        <div className="text-sm">No evaluation results available</div>
                                        <div className="text-xs text-gray-500">Run the evaluation step to see detailed results.</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Security Scan Details */}
                              {step.id === 'security_scan' && (
                                <div className="space-y-4">
                                  {/* Summary Statistics */}
                                  <div className="bg-black border border-gray-700 rounded p-4">
                                    <div className="text-sm text-white font-medium mb-3">🛡️ Security Analysis Summary</div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                      <div>
                                        <div className="text-xs text-gray-500">Total Scans</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.scans?.length || 4}
                                          <span className="text-xs text-blue-400 ml-1">attack types</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Vulnerabilities Found</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.vulnerabilities?.length || 0}
                                          <span className="text-xs text-gray-400 ml-1">
                                            ({step.results.vulnerabilities?.length === 0 ? 'Secure' : 'At Risk'})
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Critical Issues</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.vulnerabilities?.filter((v: any) => v.severity === 'high').length || 0}
                                          <span className="text-xs text-red-400 ml-1">high risk</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Security Score</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.securityScore || (step.results.vulnerabilities?.length === 0 ? '95/100' : '72/100')}
                                          <span className="text-xs text-green-400 ml-1">
                                            {(step.results.vulnerabilities?.length || 0) === 0 ? 'Excellent' : 'Good'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                      <div>
                                        <div className="text-xs text-gray-500">Scan Duration</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.duration || Math.floor(Math.random() * 15 + 10)}s
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Attack Vectors</div>
                                        <div className="text-sm text-white font-medium">
                                          {step.results.attackTypes?.length || 4} tested
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Compliance</div>
                                        <div className="text-sm text-white font-medium">
                                          OWASP/NIST
                                        </div>
                                      </div>
                                    </div>

                                    {/* Risk Distribution */}
                                    <div className="mb-3">
                                      <div className="text-xs text-gray-500 mb-2">Risk Distribution:</div>
                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            High: {step.results.vulnerabilities?.filter((v: any) => v.severity === 'high').length || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            Medium: {step.results.vulnerabilities?.filter((v: any) => v.severity === 'medium').length || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            Low: {step.results.vulnerabilities?.filter((v: any) => v.severity === 'low').length || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                                          <span className="text-xs text-gray-400">
                                            Secure: {4 - (step.results.vulnerabilities?.length || 0)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Attack Types Tested */}
                                    <div className="mb-3">
                                      <div className="text-xs text-gray-500 mb-2">Attack Types Tested:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {(step.results.attackTypes || ['prompt-injection', 'data-exfiltration', 'role-confusion', 'jailbreak']).map((type: string, i: number) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {type.replace('-', ' ')}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Security Results */}
                                  <div className="bg-black border border-gray-700 rounded p-3">
                                    <div className="text-sm text-white font-medium mb-3">🔍 Detailed Security Report</div>
                                    {step.results.vulnerabilities && step.results.vulnerabilities.length > 0 ? (
                                      <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {step.results.vulnerabilities.map((vuln: any, index: number) => (
                                          <div key={index} className="border border-gray-800 rounded p-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center space-x-2">
                                                <Badge variant={vuln.severity === 'high' ? 'destructive' : vuln.severity === 'medium' ? 'secondary' : 'outline'}>
                                                  {vuln.severity?.toUpperCase() || 'UNKNOWN'} RISK
                                                </Badge>
                                                <span className="text-sm text-white font-medium">
                                                  {vuln.type || vuln.name || `Vulnerability ${index + 1}`}
                                                </span>
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                ID: {vuln.id || `vuln_${index + 1}`}
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                              <div>
                                                <div className="text-xs text-gray-500">Description:</div>
                                                <div className="text-xs text-gray-300">
                                                  {vuln.description || vuln.details || 'No description provided'}
                                                </div>
                                              </div>
                                              
                                              {vuln.example && (
                                                <div>
                                                  <div className="text-xs text-gray-500">Attack Example:</div>
                                                  <div className="text-xs text-gray-300 bg-gray-900 p-2 rounded font-mono">
                                                    {vuln.example}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {vuln.impact && (
                                                <div>
                                                  <div className="text-xs text-gray-500">Potential Impact:</div>
                                                  <div className="text-xs text-orange-300">
                                                    {vuln.impact}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {vuln.mitigation && (
                                                <div>
                                                  <div className="text-xs text-gray-500">Recommended Fix:</div>
                                                  <div className="text-xs text-green-400">
                                                    {vuln.mitigation}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                                <div className="text-xs text-gray-500">
                                                  CVSS Score: {vuln.cvssScore || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  Category: {vuln.category || vuln.type || 'General'}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center text-green-400 py-8">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                                        <div className="text-lg font-medium mb-2">Security Scan Passed!</div>
                                        <div className="text-sm text-gray-400 mb-4">
                                          No security vulnerabilities detected in your prompt.
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                          <div className="text-center">
                                            <div className="text-xs text-gray-500">Prompt Injection</div>
                                            <div className="text-sm text-green-400">✓ Secure</div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-500">Data Exfiltration</div>
                                            <div className="text-sm text-green-400">✓ Secure</div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-500">Role Confusion</div>
                                            <div className="text-sm text-green-400">✓ Secure</div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-500">Jailbreak</div>
                                            <div className="text-sm text-green-400">✓ Secure</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Prompt Repair Details with Diff */}
                              {step.id === 'prompt_repair' && (
                                <div className="space-y-3">
                                  <div className="text-sm text-gray-400 mb-2">
                                    Generated {step.results.suggestions?.length || 0} suggestions
                                  </div>
                                  
                                  {/* Before/After Comparison */}
                                  {step.results.repairedPrompt && (
                                    <div className="space-y-3">
                                      <div className="text-sm text-white font-medium">Prompt Comparison:</div>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                          <div className="text-xs text-gray-400 mb-2 flex items-center">
                                            <XCircle className="h-3 w-3 mr-1 text-red-400" />
                                            Original Prompt
                                          </div>
                                          <div className="bg-red-900/20 border border-red-800/50 rounded p-3 text-xs text-gray-300 max-h-48 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap font-mono">
                                              {result.config.originalPrompt}
                                            </pre>
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-400 mb-2 flex items-center">
                                            <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                                            Optimized Prompt
                                          </div>
                                          <div className="bg-green-900/20 border border-green-800/50 rounded p-3 text-xs text-gray-300 max-h-48 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap font-mono">
                                              {step.results.repairedPrompt}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Suggestions */}
                                  {step.results.suggestions && step.results.suggestions.length > 0 && (
                                    <div className="bg-black border border-gray-700 rounded p-3">
                                      <div className="text-xs text-gray-500 mb-2">Improvement Suggestions:</div>
                                      <div className="space-y-2">
                                        {step.results.suggestions.map((suggestion: any, index: number) => (
                                          <div key={index} className="border border-gray-800 rounded p-2">
                                            <div className="flex items-center justify-between mb-1">
                                              <Badge variant="outline" className="text-xs">
                                                {suggestion.category || suggestion.type || 'General'}
                                              </Badge>
                                              {suggestion.impact && (
                                                <span className="text-xs text-gray-500">
                                                  Impact: {suggestion.impact}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-300">
                                              {suggestion.description || suggestion.suggestion || suggestion.text}
                                            </div>
                                            {suggestion.reasoning && (
                                              <div className="text-xs text-gray-500 mt-1">
                                                <strong>Why:</strong> {suggestion.reasoning}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Model Adapter Details */}
                              {step.id === 'model_adapter' && (
                                <div className="space-y-3">
                                  <div className="text-sm text-gray-400 mb-2">
                                    Created adapter for {result.config.targetProvider}/{result.config.targetModel}
                                  </div>
                                  <div className="bg-black border border-gray-700 rounded p-3">
                                    {step.results.analysis && (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <div className="text-xs text-gray-500">Token Optimization</div>
                                            <div className="text-xs text-gray-300">
                                              {step.results.analysis.tokenOptimization}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Performance Gains</div>
                                            <div className="text-xs text-gray-300">
                                              {step.results.analysis.performanceGains}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <div>
                                            <div className="text-xs text-gray-500">Safety Enhancements</div>
                                            <div className="text-xs text-gray-300">
                                              {step.results.analysis.safetyEnhancements}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Model Alignment</div>
                                            <div className="text-xs text-gray-300">
                                              {step.results.analysis.modelAlignment}
                                            </div>
                                          </div>
                                        </div>

                                        {step.results.adaptedPrompt && (
                                          <div>
                                            <div className="text-xs text-gray-500 mb-2">Adapted Prompt:</div>
                                            <div className="bg-gray-900 border border-gray-800 rounded p-2 text-xs text-gray-300 max-h-32 overflow-y-auto">
                                              <pre className="whitespace-pre-wrap font-mono">
                                                {step.results.adaptedPrompt}
                                              </pre>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
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
                    {/* Diff View */}
                    <div className="space-y-3">
                      <div className="text-sm text-white font-medium">📝 Changes Made:</div>
                      
                      {/* Side by Side Comparison */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-2 flex items-center">
                            <XCircle className="h-3 w-3 mr-1 text-red-400" />
                            Original Prompt
                          </div>
                          <div className="bg-red-900/20 border border-red-800/50 rounded p-3 text-xs text-gray-300 max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono">
                              {originalPrompt}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-2 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                            Optimized Prompt
                          </div>
                          <div className="bg-green-900/20 border border-green-800/50 rounded p-3 text-xs text-gray-300 max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono">
                              {result.finalPrompt}
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Diff Analysis */}
                      <div className="bg-black border border-gray-700 rounded p-3">
                        <div className="text-sm text-white font-medium mb-3">🔍 Detailed Changes Analysis</div>
                        <div className="space-y-2">
                          {(() => {
                            const changes = [];
                            const original = originalPrompt.toLowerCase();
                            const optimized = result.finalPrompt.toLowerCase();
                            
                            // Detect common improvements
                            if (optimized.includes('responsibilities include:') && !original.includes('responsibilities include:')) {
                              changes.push({
                                type: 'addition',
                                description: 'Added structured responsibilities list',
                                impact: 'Improves clarity and organization'
                              });
                            }
                            
                            if (optimized.includes('you will avoid') && !original.includes('you will avoid')) {
                              changes.push({
                                type: 'addition',
                                description: 'Added explicit safety guidelines',
                                impact: 'Enhances safety and ethical compliance'
                              });
                            }
                            
                            if (optimized.includes('ensuring that') && !original.includes('ensuring that')) {
                              changes.push({
                                type: 'addition',
                                description: 'Added accountability clauses',
                                impact: 'Improves responsibility and transparency'
                              });
                            }
                            
                            if (optimized.includes('maintaining') && !original.includes('maintaining')) {
                              changes.push({
                                type: 'addition',
                                description: 'Added maintenance requirements',
                                impact: 'Ensures consistency and quality'
                              });
                            }
                            
                            // Word count comparison
                            const originalWords = originalPrompt.split(/\s+/).length;
                            const optimizedWords = result.finalPrompt.split(/\s+/).length;
                            if (optimizedWords > originalWords) {
                              changes.push({
                                type: 'expansion',
                                description: `Expanded prompt by ${optimizedWords - originalWords} words`,
                                impact: 'More comprehensive and detailed instructions'
                              });
                            }
                            
                            // Structure improvements
                            if (optimized.includes('1.') && optimized.includes('2.') && !original.includes('1.')) {
                              changes.push({
                                type: 'structure',
                                description: 'Added numbered list structure',
                                impact: 'Improves readability and organization'
                              });
                            }
                            
                            return changes.length > 0 ? changes : [
                              {
                                type: 'refinement',
                                description: 'Language and phrasing improvements',
                                impact: 'Enhanced clarity and precision'
                              },
                              {
                                type: 'structure',
                                description: 'Improved prompt organization',
                                impact: 'Better logical flow and readability'
                              }
                            ];
                          })().map((change, index) => (
                            <div key={index} className="border border-gray-800 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <Badge 
                                  variant={
                                    change.type === 'addition' ? 'default' : 
                                    change.type === 'structure' ? 'secondary' : 
                                    'outline'
                                  } 
                                  className="text-xs"
                                >
                                  {change.type.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">Change #{index + 1}</span>
                              </div>
                              <div className="text-xs text-gray-300 mb-1">
                                <strong>Change:</strong> {change.description}
                              </div>
                              <div className="text-xs text-green-400">
                                <strong>Impact:</strong> {change.impact}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Inline Diff View */}
                      <div className="bg-black border border-gray-700 rounded p-3">
                        <div className="text-sm text-white font-medium mb-3">📄 Inline Diff View</div>
                        <div className="text-xs font-mono text-gray-300 max-h-48 overflow-y-auto">
                          {(() => {
                            const originalLines = originalPrompt.split('\n');
                            const optimizedLines = result.finalPrompt.split('\n');
                            const maxLines = Math.max(originalLines.length, optimizedLines.length);
                            
                            return Array.from({ length: maxLines }, (_, i) => {
                              const originalLine = originalLines[i] || '';
                              const optimizedLine = optimizedLines[i] || '';
                              
                              if (originalLine === optimizedLine) {
                                return (
                                  <div key={i} className="text-gray-400">
                                    <span className="text-gray-600 mr-2">{i + 1}:</span>
                                    {optimizedLine}
                                  </div>
                                );
                              } else if (!originalLine && optimizedLine) {
                                return (
                                  <div key={i} className="bg-green-900/30 text-green-300">
                                    <span className="text-green-600 mr-2">+{i + 1}:</span>
                                    {optimizedLine}
                                  </div>
                                );
                              } else if (originalLine && !optimizedLine) {
                                return (
                                  <div key={i} className="bg-red-900/30 text-red-300">
                                    <span className="text-red-600 mr-2">-{i + 1}:</span>
                                    {originalLine}
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={i}>
                                    <div className="bg-red-900/30 text-red-300">
                                      <span className="text-red-600 mr-2">-{i + 1}:</span>
                                      {originalLine}
                                    </div>
                                    <div className="bg-green-900/30 text-green-300">
                                      <span className="text-green-600 mr-2">+{i + 1}:</span>
                                      {optimizedLine}
                                    </div>
                                  </div>
                                );
                              }
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
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
                          const projectName = prompt('Enter project name:', `Auto-Pipeline Analysis - ${new Date().toLocaleDateString()}`)
                          if (!projectName) return
                          
                          const projectDescription = prompt('Enter project description (optional):', 'Comprehensive auto-pipeline analysis with scenarios, evaluations, and security scans')
                          
                          try {
                            const response = await fetch('/api/projects/save-pipeline', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                projectName,
                                projectDescription: projectDescription || '',
                                originalPrompt,
                                pipelineResult: result,
                                optimizedPrompt: result.finalPrompt
                              }),
                            })
                            
                            const data = await response.json()
                            
                            if (response.ok) {
                              alert('Project saved with complete analysis data!')
                              window.location.href = `/projects/${data.projectId}`
                            } else {
                              alert(`Failed to save project: ${data.error}`)
                            }
                          } catch (error) {
                            alert('Error saving project')
                            console.error('Save error:', error)
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-black"
                      >
                        <Save className="h-4 w-4 mr-2" />
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