'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Zap, Brain, Shield } from 'lucide-react'

interface Provider {
  id: string
  name: string
  model: string
  description: string
  available: boolean
  cost: string
  speed: 'fast' | 'medium' | 'slow'
  icon: React.ReactNode
}

interface ProviderSelectorProps {
  selectedProviders: string[]
  onProvidersChange: (providers: string[]) => void
}

export default function ProviderSelector({ selectedProviders, onProvidersChange }: ProviderSelectorProps) {
  const [providers] = useState<Provider[]>([
    {
      id: 'groq',
      name: 'Groq',
      model: 'llama-3.1-8b-instant',
      description: 'Fast inference with Llama 3.1 8B model',
      available: true,
      cost: 'Free',
      speed: 'fast',
      icon: <Zap className="h-5 w-5 text-green-600" />
    },
    {
      id: 'openai',
      name: 'OpenAI',
      model: 'gpt-4',
      description: 'High-quality responses with GPT-4',
      available: false,
      cost: '$0.03/1K tokens',
      speed: 'medium',
      icon: <Brain className="h-5 w-5 text-blue-600" />
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      model: 'claude-3-sonnet',
      description: 'Advanced reasoning with Claude 3 Sonnet',
      available: false,
      cost: '$0.003/1K tokens',
      speed: 'medium',
      icon: <Shield className="h-5 w-5 text-purple-600" />
    }
  ])

  const handleProviderToggle = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onProvidersChange(selectedProviders.filter(id => id !== providerId))
    } else {
      onProvidersChange([...selectedProviders, providerId])
    }
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'slow':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSpeedBadge = (speed: string) => {
    const colors = {
      fast: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      slow: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge variant="outline" className={colors[speed as keyof typeof colors]}>
        {speed.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Providers</CardTitle>
        <CardDescription>
          Select which LLM providers to use for evaluation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProviders.includes(provider.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                !provider.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => provider.available && handleProviderToggle(provider.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {provider.available ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {provider.icon}
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-600">{provider.model}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getSpeedBadge(provider.speed)}
                  <Badge variant="outline" className="text-xs">
                    {provider.cost}
                  </Badge>
                  {selectedProviders.includes(provider.id) && (
                    <Badge variant="default" className="bg-blue-600">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                {provider.description}
              </div>
              
              {!provider.available && (
                <div className="mt-2 text-sm text-red-600">
                  API key not configured
                </div>
              )}
            </div>
          ))}
        </div>
        
        {selectedProviders.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              Please select at least one provider to run evaluations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
