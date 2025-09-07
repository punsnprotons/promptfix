'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProviderSelector from '@/components/ProviderSelector'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Target,
  Zap,
  Eye,
  RefreshCw,
  TrendingUp,
  Lock
} from 'lucide-react'

interface Vulnerability {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  reproduction: string
  mitigation: string
  bypassRate: number
  detectedAt: string
  falsePositive?: boolean
}

interface RedTeamRun {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  systemPrompt: string
  attacksUsed: string[]
  vulnerabilities: Vulnerability[]
  summary: {
    totalAttacks: number
    successfulBypasses: number
    bypassRate: number
    criticalVulnerabilities: number
    highVulnerabilities: number
    mediumVulnerabilities: number
    lowVulnerabilities: number
  }
  startedAt: string
  finishedAt?: string
  cost: number
  tokens: number
}

export default function SecurityScanner() {
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

  const [selectedAttackTypes, setSelectedAttackTypes] = useState([
    'jailbreak',
    'prompt_injection', 
    'data_exfiltration',
    'role_confusion'
  ])
  
  const [maxCost, setMaxCost] = useState(1.0)
  const [adaptiveMode, setAdaptiveMode] = useState(true)
  const [selectedProviders, setSelectedProviders] = useState(['groq'])
  
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<RedTeamRun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)

  const availableAttackTypes = [
    { id: 'jailbreak', name: 'Jailbreak Attempts', description: 'Attempts to bypass safety guidelines' },
    { id: 'prompt_injection', name: 'Prompt Injection', description: 'Injection of malicious instructions' },
    { id: 'data_exfiltration', name: 'Data Exfiltration', description: 'Attempts to extract sensitive information' },
    { id: 'role_confusion', name: 'Role Confusion', description: 'Attempts to confuse AI role boundaries' },
    { id: 'tool_abuse', name: 'Tool Abuse', description: 'Misuse of available tools and functions' },
    { id: 'instruction_hierarchy_bypass', name: 'Instruction Bypass', description: 'Attempts to override instruction hierarchy' },
    { id: 'social_engineering', name: 'Social Engineering', description: 'Psychological manipulation attempts' },
    { id: 'prompt_leakage', name: 'Prompt Leakage', description: 'Attempts to reveal system prompts' },
    { id: 'context_manipulation', name: 'Context Manipulation', description: 'Manipulation of conversation context' },
    { id: 'adversarial_examples', name: 'Adversarial Examples', description: 'Crafty inputs designed to confuse' }
  ]

  const runSecurityScan = async () => {
    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          attackTypes: selectedAttackTypes,
          maxCost,
          adaptiveMode
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Security scan failed')
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsScanning(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Security Scanner</h1>
        <p className="text-gray-600">Red-team your system prompts with comprehensive security testing</p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Scan Configuration
          </CardTitle>
          <CardDescription>
            Configure security scan parameters and attack types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-32 p-3 border rounded-md resize-none"
              placeholder="Enter your system prompt to test..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Attack Types</label>
            <div className="grid md:grid-cols-2 gap-2">
              {availableAttackTypes.map(attackType => (
                <label key={attackType.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedAttackTypes.includes(attackType.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAttackTypes([...selectedAttackTypes, attackType.id])
                      } else {
                        setSelectedAttackTypes(selectedAttackTypes.filter(t => t !== attackType.id))
                      }
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{attackType.name}</div>
                    <div className="text-xs text-gray-600">{attackType.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Cost ($)</label>
              <input
                type="number"
                value={maxCost}
                onChange={(e) => setMaxCost(parseFloat(e.target.value) || 1.0)}
                className="w-full p-2 border rounded-md"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={adaptiveMode}
                onChange={(e) => setAdaptiveMode(e.target.checked)}
              />
              <span className="text-sm">Adaptive Mode (learns from responses)</span>
            </div>
          </div>

          <Button 
            onClick={runSecurityScan} 
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Security Scan...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run Security Scan
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
              <span className="font-medium">Security Scan Failed</span>
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
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Security Scan Results
                  </CardTitle>
                  <CardDescription>Run ID: {result.id}</CardDescription>
                </div>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.totalAttacks}</div>
                  <div className="text-sm text-gray-600">Total Attacks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.summary.successfulBypasses}</div>
                  <div className="text-sm text-gray-600">Successful Bypasses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(result.summary.bypassRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Bypass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${result.cost.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{result.summary.criticalVulnerabilities}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{result.summary.highVulnerabilities}</div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{result.summary.mediumVulnerabilities}</div>
                  <div className="text-sm text-gray-600">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{result.summary.lowVulnerabilities}</div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerabilities */}
          {result.vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Vulnerabilities Found ({result.vulnerabilities.length})</h2>
              
              {result.vulnerabilities.map((vulnerability, index) => (
                <Card key={vulnerability.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(vulnerability.severity)}
                        <div>
                          <CardTitle className="text-lg">{vulnerability.title}</CardTitle>
                          <CardDescription>
                            {vulnerability.type.replace('_', ' ')} • 
                            {(vulnerability.bypassRate * 100).toFixed(1)}% bypass rate
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(vulnerability.severity)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVulnerability(vulnerability)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium mb-1">Description:</div>
                        <div className="text-sm text-gray-600">{vulnerability.description}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Attack Pattern:</div>
                        <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                          {vulnerability.reproduction}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Mitigation:</div>
                        <div className="text-sm text-gray-600">{vulnerability.mitigation}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">No Vulnerabilities Found!</span>
                </div>
                <p className="text-green-700 mt-2">
                  Your system prompt appears to be secure against the tested attack types.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Vulnerability Detail Modal */}
      {selectedVulnerability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(selectedVulnerability.severity)}
                  <CardTitle>{selectedVulnerability.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {getSeverityBadge(selectedVulnerability.severity)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVulnerability(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Vulnerability Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {selectedVulnerability.type}</div>
                  <div><strong>Severity:</strong> {selectedVulnerability.severity}</div>
                  <div><strong>Bypass Rate:</strong> {(selectedVulnerability.bypassRate * 100).toFixed(1)}%</div>
                  <div><strong>Detected:</strong> {new Date(selectedVulnerability.detectedAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <div className="p-3 bg-gray-50 rounded">
                  {selectedVulnerability.description}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Attack Pattern</h4>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {selectedVulnerability.reproduction}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommended Mitigation</h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  {selectedVulnerability.mitigation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
