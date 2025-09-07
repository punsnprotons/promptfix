'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Clock,
  User,
  GitBranch
} from 'lucide-react'

interface PromptVersion {
  id: string
  version_number: number
  prompt_text: string
  changes: string | null
  created_at: string
  created_by: string | null
}

interface PromptVersionsSectionProps {
  projectId: string
  onVersionRestore: () => void
}

export default function PromptVersionsSection({ projectId, onVersionRestore }: PromptVersionsSectionProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)

  useEffect(() => {
    fetchVersions()
  }, [projectId])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreVersion = async (version: PromptVersion) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_prompt: version.prompt_text
        }),
      })

      if (response.ok) {
        alert(`Restored to version ${version.version_number}`)
        onVersionRestore()
      } else {
        alert('Failed to restore version')
      }
    } catch (error) {
      console.error('Error restoring version:', error)
      alert('Error restoring version')
    }
  }

  const toggleExpanded = (versionId: string) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-800 rounded"></div>
        ))}
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Version History</h3>
        <p className="text-gray-400">
          Version history will appear here when you make changes to your prompt
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {versions.map((version, index) => {
        const isLatest = index === 0
        const isExpanded = expandedVersion === version.id
        
        return (
          <div key={version.id} className="border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Badge variant={isLatest ? "default" : "outline"} className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  v{version.version_number}
                  {isLatest && " (Current)"}
                </Badge>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(version.created_at).toLocaleString()}
                </div>
                {version.created_by && (
                  <div className="flex items-center text-xs text-gray-400">
                    <User className="h-3 w-3 mr-1" />
                    User
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(version.id)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {isExpanded ? (
                    <EyeOff className="h-3 w-3 mr-1" />
                  ) : (
                    <Eye className="h-3 w-3 mr-1" />
                  )}
                  {isExpanded ? 'Hide' : 'View'}
                </Button>
                
                {!isLatest && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreVersion(version)}
                    className="border-orange-600 text-orange-300 hover:bg-orange-900"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </div>

            {version.changes && (
              <div className="text-sm text-gray-400 mb-2">
                <strong>Changes:</strong> {version.changes}
              </div>
            )}

            {isExpanded && (
              <div className="mt-3 bg-black border border-gray-700 rounded p-3">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                  {version.prompt_text}
                </pre>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
