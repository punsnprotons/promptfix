'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/Navigation'
import { getProject, type Project } from '@/lib/database'
import PromptVersionsSection from '@/components/PromptVersionsSection'
import { 
  ArrowLeft, 
  Play, 
  Settings, 
  BarChart3, 
  Shield, 
  Zap, 
  FileText, 
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MessageSquare
} from 'lucide-react'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [stats, setStats] = useState({
    promptVersions: 0,
    evaluationRuns: 0,
    securityScans: 0,
    modelAdapters: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [showActivityDetails, setShowActivityDetails] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const projectData = await getProject(projectId)
      if (projectData) {
        setProject(projectData)
        setEditedPrompt(projectData.system_prompt)
        await fetchProjectStats()
        await fetchRecentActivity()
      } else {
        setError('Project not found')
      }
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectStats = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching project stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activity`)
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data)
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleEditPrompt = () => {
    setIsEditing(true)
  }

  const handleSavePrompt = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_prompt: editedPrompt
        }),
      })

      if (response.ok) {
        setProject(prev => prev ? { ...prev, system_prompt: editedPrompt } : null)
        setIsEditing(false)
        alert('Prompt updated successfully!')
        
        // Refresh project stats and activity
        await fetchProjectStats()
        await fetchRecentActivity()
      } else {
        alert('Failed to update prompt')
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
      alert('Error updating prompt')
    }
  }

  const handleCancelEdit = () => {
    setEditedPrompt(project?.system_prompt || '')
    setIsEditing(false)
  }

  const handleRunAnalysis = () => {
    // Store the current prompt in localStorage and redirect to auto-pipeline
    localStorage.setItem('pendingPrompt', project?.system_prompt || '')
    router.push('/auto-pipeline')
  }

  const handleQuickAction = async (action: string) => {
    if (!project?.system_prompt) return

    const actionConfig = {
      scenarios: {
        generateScenarios: true,
        runEvaluation: false,
        securityScan: false,
        promptRepair: false,
        createAdapter: false,
        scenarioCount: 18
      },
      evaluation: {
        generateScenarios: true,
        runEvaluation: true,
        securityScan: false,
        promptRepair: false,
        createAdapter: false,
        scenarioCount: 18
      },
      security: {
        generateScenarios: false,
        runEvaluation: false,
        securityScan: true,
        promptRepair: false,
        createAdapter: false
      },
      repair: {
        generateScenarios: false,
        runEvaluation: false,
        securityScan: false,
        promptRepair: true,
        createAdapter: false
      }
    }

    const config = actionConfig[action as keyof typeof actionConfig]
    if (!config) return

    try {
      const response = await fetch('/api/auto-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'run-pipeline',
          originalPrompt: project.system_prompt,
          ...config
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${action} completed successfully!`)
        
        // Save the pipeline result
        await savePipelineResult(result.data)
        
        // Refresh project stats and activity
        await fetchProjectStats()
        await fetchRecentActivity()
      } else {
        alert(`Failed to run ${action}`)
      }
    } catch (error) {
      console.error(`Error running ${action}:`, error)
      alert(`Error running ${action}`)
    }
  }

  const savePipelineResult = async (pipelineResult: any) => {
    try {
      const response = await fetch('/api/projects/save-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: project?.name || 'Quick Action Result',
          projectDescription: `Quick action result for ${project?.name}`,
          originalPrompt: project?.system_prompt,
          pipelineResult
        }),
      })

      if (!response.ok) {
        console.error('Failed to save pipeline result')
      }
    } catch (error) {
      console.error('Error saving pipeline result:', error)
    }
  }

  const handleSettings = () => {
    // TODO: Implement settings modal or page
    alert('Settings functionality coming soon!')
  }

  const handleShowActivityDetails = (activity: any) => {
    setSelectedActivity(activity)
    setShowActivityDetails(true)
  }

  const handleCloseActivityDetails = () => {
    setSelectedActivity(null)
    setShowActivityDetails(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'The project you are looking for does not exist.'}</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-black">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-gray-400 mt-1">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleEditPrompt}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleSettings}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={() => router.push(`/projects/${projectId}/chat`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-black"
              onClick={handleRunAnalysis}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Prompt Versions</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.promptVersions}</div>
              <p className="text-xs text-gray-400">Total versions</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Evaluation Runs</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.evaluationRuns}</div>
              <p className="text-xs text-gray-400">Total runs</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Security Scans</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.securityScans}</div>
              <p className="text-xs text-gray-400">Total scans</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Model Adapters</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.modelAdapters}</div>
              <p className="text-xs text-gray-400">Optimized versions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* System Prompt */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                System Prompt
              </CardTitle>
              <CardDescription className="text-gray-400">
                {isEditing ? 'Edit your system prompt' : 'Current system prompt for this project'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full h-64 p-4 bg-black border border-gray-700 rounded-lg text-gray-300 font-mono text-sm resize-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your system prompt..."
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleSavePrompt}
                      className="bg-orange-500 hover:bg-orange-600 text-black"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-black border border-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {project.system_prompt}
                  </pre>
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </div>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={handleEditPrompt}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Prompt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-500" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Run analysis and optimization tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-black justify-start"
                onClick={handleRunAnalysis}
              >
                <Play className="h-4 w-4 mr-2" />
                Run Auto Pipeline
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                  onClick={() => handleQuickAction('scenarios')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Generate Scenarios
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                  onClick={() => handleQuickAction('evaluation')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Run Evaluation
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                  onClick={() => handleQuickAction('security')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security Scan
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
                  onClick={() => handleQuickAction('repair')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Prompt Repair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompt Version History */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              Prompt Revision History
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track changes and rollback to previous versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromptVersionsSection projectId={projectId} onVersionRestore={fetchProject} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest runs and updates for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Activity Yet</h3>
                <p className="text-gray-400 mb-4">
                  Run your first analysis to see activity here
                </p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                  onClick={handleRunAnalysis}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start First Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {String(activity.name || 'Unknown Activity')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Unknown Date'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {String(activity.type || 'unknown')} • {String(activity.status || 'unknown')}
                      </p>
                      {activity.summary && (
                        <p className="text-xs text-gray-300 mt-1">
                          {String(activity.summary)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div></div>
                        <button
                          onClick={() => handleShowActivityDetails(activity)}
                          className="text-xs text-orange-400 hover:text-orange-300 hover:underline"
                        >
                          Show Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Activity Details Modal */}
        {showActivityDetails && selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Activity Details</h3>
                <button
                  onClick={handleCloseActivityDetails}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Basic Information</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-white"><span className="text-gray-400">Name:</span> {String(selectedActivity.name || 'Unknown')}</p>
                      <p className="text-white"><span className="text-gray-400">Type:</span> {String(selectedActivity.type || 'Unknown')}</p>
                      <p className="text-white"><span className="text-gray-400">Status:</span> {String(selectedActivity.status || 'Unknown')}</p>
                      <p className="text-white"><span className="text-gray-400">Date:</span> {selectedActivity.created_at ? new Date(selectedActivity.created_at).toLocaleString() : 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Summary</h4>
                    <p className="text-sm text-white">{String(selectedActivity.summary || 'No summary available')}</p>
                  </div>
                </div>
                
                {selectedActivity.details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Detailed Configuration</h4>
                    <div className="bg-black border border-gray-700 rounded p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {typeof selectedActivity.details === 'object' 
                          ? JSON.stringify(selectedActivity.details, null, 2)
                          : String(selectedActivity.details)
                        }
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedActivity.type === 'evaluation' && selectedActivity.details?.results && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Evaluation Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Total Runs</p>
                        <p className="text-lg font-bold text-white">{selectedActivity.details.results.summary?.totalRuns || 0}</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Pass Rate</p>
                        <p className="text-lg font-bold text-green-400">{Math.round(selectedActivity.details.results.summary?.passRate || 0)}%</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Average Score</p>
                        <p className="text-lg font-bold text-blue-400">{(selectedActivity.details.results.summary?.averageScore || 0).toFixed(1)}/10</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Total Cost</p>
                        <p className="text-lg font-bold text-orange-400">${(selectedActivity.details.results.summary?.totalCost || 0).toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedActivity.type === 'scenarios' && selectedActivity.details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Generated Scenarios</h4>
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-xs text-gray-400">Total Scenarios</p>
                      <p className="text-lg font-bold text-white">{Array.isArray(selectedActivity.details) ? selectedActivity.details.length : 0}</p>
                    </div>
                  </div>
                )}
                
                {selectedActivity.type === 'security' && selectedActivity.details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Security Scan Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Vulnerabilities Found</p>
                        <p className="text-lg font-bold text-red-400">{selectedActivity.details.vulnerabilities?.length || 0}</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Security Score</p>
                        <p className="text-lg font-bold text-yellow-400">{selectedActivity.details.summary?.securityScore || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedActivity.type === 'pipeline' && selectedActivity.details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Pipeline Steps</h4>
                    <div className="space-y-2">
                      {selectedActivity.details.steps?.map((step: any, index: number) => (
                        <div key={index} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{String(step.name || 'Unknown Step')}</p>
                            <p className="text-xs text-gray-400">{String(step.description || 'No description')}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(step.status)}
                            <span className="text-xs text-gray-300">{String(step.status || 'unknown')}</span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-400">No step details available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
