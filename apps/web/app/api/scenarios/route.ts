import { NextRequest, NextResponse } from 'next/server'
import { ScenarioGenerator, CoverageCalculator, AdaptiveExplorer } from '@/lib/scenario-generator'

const scenarioGenerator = new ScenarioGenerator()
const coverageCalculator = new CoverageCalculator()
const adaptiveExplorer = new AdaptiveExplorer()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      systemPrompt,
      count = 10,
      types = ['user_intent', 'constraint', 'adversarial', 'edge_case'],
      includeAdversarial = true,
      diversityBoost = true,
      exploreGaps = false,
      existingScenarios = []
    } = body

    if (!systemPrompt) {
      return NextResponse.json({ 
        error: 'System prompt is required' 
      }, { status: 400 })
    }

    let scenarios

    if (exploreGaps && existingScenarios.length > 0) {
      // Use adaptive explorer to fill coverage gaps
      scenarios = await adaptiveExplorer.exploreGaps(systemPrompt, existingScenarios)
    } else {
      // Generate new scenarios
      scenarios = await scenarioGenerator.generateScenarios(systemPrompt, {
        count,
        types,
        includeAdversarial,
        diversityBoost
      })
    }

    // Calculate coverage metrics
    const coverage = coverageCalculator.calculateCoverage(scenarios)

    // Create scenario suite
    const suite = {
      id: `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Generated Scenarios - ${new Date().toLocaleDateString()}`,
      version: '1.0.0',
      source: 'generated',
      scenarios,
      coverageSnapshot: {
        intentCoverage: coverage.intentCoverage,
        constraintCoverage: coverage.constraintCoverage,
        failureCoverage: coverage.failureCoverage,
        diversityScore: coverage.diversityScore
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        suite,
        coverage,
        summary: {
          totalScenarios: scenarios.length,
          scenarioTypes: coverage.scenarioTypes,
          tags: coverage.tags,
          diversityScore: coverage.diversityScore
        }
      }
    })
  } catch (error) {
    console.error('Scenario generation error:', error)
    return NextResponse.json({ 
      error: 'Scenario generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'coverage') {
      const scenarios = JSON.parse(searchParams.get('scenarios') || '[]')
      const coverage = coverageCalculator.calculateCoverage(scenarios)
      
      return NextResponse.json({ 
        success: true, 
        data: coverage 
      })
    }

    // Return available scenario types and templates
    return NextResponse.json({ 
      success: true, 
      data: {
        availableTypes: ['user_intent', 'constraint', 'adversarial', 'edge_case'],
        templates: {
          user_intent: [
            'Order Status Inquiry',
            'Product Information Request',
            'Technical Support',
            'Account Management',
            'Billing Question'
          ],
          constraint: [
            'Length Limitation',
            'Format Requirements',
            'Tone Guidelines',
            'Safety Constraints',
            'Privacy Protection'
          ],
          adversarial: [
            'Data Exfiltration Attempt',
            'Jailbreak Attempt',
            'Role Confusion',
            'Prompt Injection',
            'Tool Abuse'
          ],
          edge_case: [
            'Empty Input',
            'Very Long Input',
            'Special Characters',
            'Multilingual Input',
            'Noisy Input'
          ]
        }
      }
    })
  } catch (error) {
    console.error('Error fetching scenario info:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch scenario information' 
    }, { status: 500 })
  }
}
