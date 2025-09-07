'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, BarChart3, Shield, Zap, ArrowRight, Shuffle, Play } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-xl font-bold text-white">System Prompt Tool</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-black">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            System Prompt Analysis &{' '}
            <span className="text-orange-500">Auto-Repair</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Production-ready web app that ingests system prompts, auto-generates user interaction scenarios, 
            runs evaluations across selected LLMs, and proposes iterative rewrites until pass criteria are met.
          </p>
        </div>
      </section>

      {/* Prompt Analysis Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Analyze Your System Prompt
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter your system prompt below or choose from our curated examples to get started with comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">System Prompt</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => {
                      const prompts = [
                        "You are a helpful customer support assistant for an e-commerce platform. Your role is to: 1. Help customers with order inquiries, returns, and general questions 2. Provide accurate information about products and services 3. Escalate complex issues to human agents when necessary 4. Maintain a friendly and professional tone 5. Never provide personal information about other customers",
                        "You are an AI code review assistant. Your responsibilities include: 1. Analyzing code for bugs, security vulnerabilities, and performance issues 2. Suggesting improvements for code quality and best practices 3. Explaining complex code logic in simple terms 4. Identifying potential edge cases and error handling 5. Maintaining a constructive and educational tone in all feedback",
                        "You are a creative writing assistant specializing in fiction. Help users with: 1. Character development and backstory creation 2. Plot structure and narrative pacing 3. Dialogue writing and character voice 4. World-building and setting descriptions 5. Maintaining consistency in tone and style throughout the story",
                        "You are a data analysis assistant. Your role is to: 1. Help users understand complex datasets and statistical concepts 2. Suggest appropriate analysis methods and visualizations 3. Interpret results and provide actionable insights 4. Explain statistical significance and confidence intervals 5. Maintain accuracy and avoid misleading interpretations",
                        "You are a personal productivity coach. Assist users with: 1. Goal setting and planning strategies 2. Time management and prioritization techniques 3. Habit formation and behavior change 4. Motivation and accountability systems 5. Providing encouragement while maintaining realistic expectations"
                      ]
                      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
                      const textarea = document.getElementById('system-prompt') as HTMLTextAreaElement
                      if (textarea) {
                        textarea.value = randomPrompt
                      }
                    }}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random Example
                  </Button>
                </div>
                <Textarea
                  id="system-prompt"
                  placeholder="Enter your system prompt here..."
                  className="min-h-[200px] bg-black border-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500"
                  defaultValue=""
                />
              </div>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-black px-8"
                  onClick={() => {
                    const textarea = document.getElementById('system-prompt') as HTMLTextAreaElement
                    const prompt = textarea?.value || ''
                    if (prompt.trim()) {
                      // Store the prompt in localStorage and redirect to auto pipeline
                      localStorage.setItem('pendingPrompt', prompt)
                      window.location.href = '/auto-pipeline'
                    } else {
                      alert('Please enter a system prompt first!')
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Auto Pipeline Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Core Differentiators
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Built for AI engineers, teams handling frequent model updates, and platforms wanting automated scenario discovery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <CardTitle className="text-white">System Prompt Copilot</CardTitle>
              <CardDescription className="text-gray-300">
                Automatically synthesize realistic user journeys, constraints, and adversarial probes into a living test suite.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
              <CardTitle className="text-white">Multi-LLM Conformance</CardTitle>
              <CardDescription className="text-gray-300">
                Normalize behavior across Anthropic/OpenAI/Gemini/Llama with model-specific prompt adapters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <CardTitle className="text-white">Security-Grade Guardrails</CardTitle>
              <CardDescription className="text-gray-300">
                Turnkey red-teaming and fuzzing with curated and adaptive attacks for comprehensive security testing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-black" />
              </div>
              <CardTitle className="text-white">Coverage-First Testing</CardTitle>
              <CardDescription className="text-gray-300">
                Implement diversity/coverage-driven scenario generation to maximize defect discovery per token.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">5+</div>
              <div className="text-gray-300">LLM Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
              <div className="text-gray-300">Coverage Metrics</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">CI/CD</div>
              <div className="text-gray-300">Ready</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">Auto</div>
              <div className="text-gray-300">Repair</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-orange-500 rounded-2xl p-8 text-center text-black">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join AI engineers building reliable LLM-backed applications with automated prompt analysis and repair.
          </p>
          <Button size="lg" variant="secondary" asChild className="bg-black text-white hover:bg-gray-800">
            <Link href="/dashboard">
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-300">
            <p>&copy; 2024 System Prompt Tool. Built for the AI engineering community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}