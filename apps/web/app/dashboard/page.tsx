'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, BarChart3, Shield, Zap, ArrowRight, Clock, CheckCircle, XCircle, Wrench, Settings } from 'lucide-react'
import CreateProjectModal from '@/components/CreateProjectModal'
import { getProjects, type Project } from '@/lib/database'

// Remove the old interface since we're importing it from database.ts

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects([...projects, newProject])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-xl font-bold text-white">System Prompt Tool</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                Settings
              </Button>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Projects</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <p className="text-xs text-gray-400">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Evaluations</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {projects.reduce((acc, p) => acc + (p._count?.evalRuns || 0), 0)}
              </div>
              <p className="text-xs text-gray-400">
                Running evaluations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Prompt Versions</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {projects.reduce((acc, p) => acc + (p._count?.promptVersions || 0), 0)}
              </div>
              <p className="text-xs text-gray-400">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Security Scans</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-gray-400">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                      <CardDescription className="mt-1 text-gray-300">
                        {project.description}
                      </CardDescription>
                    </div>
                    {project.evalRuns[0] && getStatusIcon(project.evalRuns[0].status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Prompt Versions</span>
                      <span className="font-medium text-white">{project._count?.promptVersions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Scenario Suites</span>
                      <span className="font-medium text-white">{project._count?.scenarioSuites || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Eval Runs</span>
                      <span className="font-medium text-white">{project._count?.evalRuns || 0}</span>
                    </div>
                    
                    {project._count?.evalRuns > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Last Run</span>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">Completed</Badge>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-black">
                        <Link href={`/projects/${project.id}`}>
                          View Project
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Project Card */}
            <Card className="border-dashed border-2 border-gray-600 hover:border-orange-500 transition-colors bg-gray-900">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Create New Project</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Start analyzing a new system prompt
                  </p>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-300">
              Common tasks to get started with system prompt analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
                <Link href="/scenarios">
                  <Zap className="h-5 w-5 mb-2 text-orange-500" />
                  <span className="font-medium">Generate Scenarios</span>
                  <span className="text-sm text-gray-400">Auto-create test scenarios</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
                <Link href="/evaluation">
                  <BarChart3 className="h-5 w-5 mb-2 text-orange-500" />
                  <span className="font-medium">Run Evaluation</span>
                  <span className="text-sm text-gray-400">Test across multiple LLMs</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
                <Link href="/security">
                  <Shield className="h-5 w-5 mb-2 text-orange-500" />
                  <span className="font-medium">Security Scan</span>
                  <span className="text-sm text-gray-400">Red-team your prompts</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
                <Link href="/prompt-repair">
                  <Wrench className="h-5 w-5 mb-2 text-orange-500" />
                  <span className="font-medium">Prompt Repair</span>
                  <span className="text-sm text-gray-400">AI-powered improvements</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
                <Link href="/model-adapters">
                  <Settings className="h-5 w-5 mb-2 text-orange-500" />
                  <span className="font-medium">Model Adapters</span>
                  <span className="text-sm text-gray-400">Provider-specific optimization</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black" asChild>
                <Link href="/auto-pipeline">
                  <Zap className="h-5 w-5 mb-2" />
                  <span className="font-medium">Auto Pipeline</span>
                  <span className="text-sm">Complete automated workflow</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}