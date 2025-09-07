import { NextRequest, NextResponse } from 'next/server'
import { RedTeamEngine, AttackType, DefaultPolicyPacks } from '@/lib/redteam-engine'

const redTeamEngine = new RedTeamEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      systemPrompt,
      attackTypes = ['jailbreak', 'prompt_injection', 'data_exfiltration'],
      policyPacks = [DefaultPolicyPacks.getSecurityPack()],
      maxCost = 1.0,
      adaptiveMode = true
    } = body

    if (!systemPrompt) {
      return NextResponse.json({ 
        error: 'System prompt is required' 
      }, { status: 400 })
    }

    // Run red-team scan
    const result = await redTeamEngine.runRedTeamScan(systemPrompt, {
      attackTypes: attackTypes as AttackType[],
      policyPacks,
      maxCost,
      adaptiveMode
    })

    return NextResponse.json({ 
      success: true, 
      data: result 
    })
  } catch (error) {
    console.error('Red-team scan error:', error)
    return NextResponse.json({ 
      error: 'Red-team scan failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'patterns') {
      const attackType = searchParams.get('type') as AttackType
      
      if (attackType) {
        const patterns = require('@/lib/redteam-engine').AttackPatterns.getPatterns(attackType)
        return NextResponse.json({ 
          success: true, 
          data: { patterns, attackType }
        })
      } else {
        const allPatterns = require('@/lib/redteam-engine').AttackPatterns.getAllPatterns()
        return NextResponse.json({ 
          success: true, 
          data: { patterns: allPatterns }
        })
      }
    }

    if (action === 'policy-packs') {
      const securityPack = DefaultPolicyPacks.getSecurityPack()
      const compliancePack = DefaultPolicyPacks.getCompliancePack()
      
      return NextResponse.json({ 
        success: true, 
        data: {
          packs: [securityPack, compliancePack],
          totalPacks: 2
        }
      })
    }

    // Return available attack types and default configuration
    return NextResponse.json({ 
      success: true, 
      data: {
        availableAttackTypes: [
          'jailbreak',
          'prompt_injection', 
          'data_exfiltration',
          'role_confusion',
          'tool_abuse',
          'instruction_hierarchy_bypass',
          'social_engineering',
          'prompt_leakage',
          'context_manipulation',
          'adversarial_examples'
        ],
        defaultPolicyPacks: [
          DefaultPolicyPacks.getSecurityPack(),
          DefaultPolicyPacks.getCompliancePack()
        ],
        severityLevels: ['low', 'medium', 'high', 'critical']
      }
    })
  } catch (error) {
    console.error('Error fetching red-team info:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch red-team information' 
    }, { status: 500 })
  }
}
