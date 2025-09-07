import { z } from 'zod'

// Provider types
export const ProviderType = z.enum(['openai', 'anthropic', 'google', 'azure', 'bedrock', 'ollama'])
export type ProviderType = z.infer<typeof ProviderType>

// Message types
export const MessageRole = z.enum(['system', 'user', 'assistant'])
export type MessageRole = z.infer<typeof MessageRole>

export const Message = z.object({
  role: MessageRole,
  content: string,
})
export type Message = z.infer<typeof Message>

// Provider request/response types
export const ProviderRequest = z.object({
  messages: z.array(Message),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  stream: z.boolean().optional(),
})
export type ProviderRequest = z.infer<typeof ProviderRequest>

export const ProviderResponse = z.object({
  output: z.string(),
  tokens: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }),
  cost: z.number(),
  latency: z.number(),
  model: z.string(),
  provider: z.string(),
})
export type ProviderResponse = z.infer<typeof ProviderResponse>

// Scenario types
export const ScenarioType = z.enum(['user_intent', 'constraint', 'adversarial', 'edge_case'])
export type ScenarioType = z.infer<typeof ScenarioType>

export const ValidatorType = z.enum([
  'contains',
  'regex',
  'json_schema',
  'tone',
  'security_check',
  'policy_check',
  'semantic_similarity',
  'exact_match',
])
export type ValidatorType = z.infer<typeof ValidatorType>

export const Validator = z.object({
  type: ValidatorType,
  value: z.union([z.string(), z.number(), z.object({})]),
  description: z.string(),
  weight: z.number().min(0).max(1).optional(),
})
export type Validator = z.infer<typeof Validator>

export const ScenarioInputs = z.object({
  messages: z.array(Message),
  context: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})
export type ScenarioInputs = z.infer<typeof ScenarioInputs>

export const ScenarioChecks = z.object({
  validators: z.array(Validator),
  passThreshold: z.number().min(0).max(1).optional(),
})
export type ScenarioChecks = z.infer<typeof ScenarioChecks>

export const Scenario = z.object({
  id: z.string(),
  type: ScenarioType,
  intent: z.string().optional(),
  inputs: ScenarioInputs,
  checks: ScenarioChecks,
  adversarial: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Scenario = z.infer<typeof Scenario>

// Evaluation types
export const EvalRunStatus = z.enum(['pending', 'running', 'completed', 'failed', 'cancelled'])
export type EvalRunStatus = z.infer<typeof EvalRunStatus>

export const ScoringResult = z.object({
  overall: z.number().min(0).max(1),
  instruction_adherence: z.number().min(0).max(1).optional(),
  tone: z.number().min(0).max(1).optional(),
  security: z.number().min(0).max(1).optional(),
  format_compliance: z.number().min(0).max(1).optional(),
  harmlessness: z.number().min(0).max(1).optional(),
})
export type ScoringResult = z.infer<typeof ScoringResult>

export const EvalCase = z.object({
  id: z.string(),
  scenarioId: z.string(),
  provider: z.string(),
  model: z.string(),
  output: z.string().optional(),
  scores: ScoringResult.optional(),
  pass: z.boolean().optional(),
  latencyMs: z.number().optional(),
  cost: z.number().optional(),
  createdAt: z.date(),
})
export type EvalCase = z.infer<typeof EvalCase>

// Coverage types
export const CoverageMetrics = z.object({
  intentCoverage: z.number().min(0).max(100),
  constraintCoverage: z.number().min(0).max(100),
  failureCoverage: z.number().min(0).max(100),
})
export type CoverageMetrics = z.infer<typeof CoverageMetrics>

// Red team types
export const AttackType = z.enum([
  'jailbreak',
  'prompt_injection',
  'data_exfiltration',
  'role_confusion',
  'tool_abuse',
  'instruction_hierarchy_bypass',
])
export type AttackType = z.infer<typeof AttackType>

export const Vulnerability = z.object({
  type: AttackType,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  reproduction: z.string(),
  mitigation: z.string(),
  bypassRate: z.number().min(0).max(1),
})
export type Vulnerability = z.infer<typeof Vulnerability>

// Policy types
export const PolicyCheck = z.object({
  name: z.string(),
  type: z.enum(['regex', 'keyword', 'semantic', 'custom']),
  pattern: z.string(),
  description: z.string(),
  category: z.enum(['security', 'compliance', 'format', 'content']),
})
export type PolicyCheck = z.infer<typeof PolicyCheck>

export const PolicyPack = z.object({
  id: z.string(),
  name: z.string(),
  checks: z.array(PolicyCheck),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type PolicyPack = z.infer<typeof PolicyPack>

// Threshold types
export const ThresholdConfig = z.object({
  minPassRate: z.number().min(0).max(1).optional(),
  maxBypassRate: z.number().min(0).max(1).optional(),
  maxCostDrift: z.number().min(0).optional(),
  maxLatency: z.number().positive().optional(),
  schemaCompliance: z.number().min(0).max(1).optional(),
})
export type ThresholdConfig = z.infer<typeof ThresholdConfig>

// API types
export const CreateProjectRequest = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>

export const CreatePromptVersionRequest = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.any()).optional(),
})
export type CreatePromptVersionRequest = z.infer<typeof CreatePromptVersionRequest>

export const GenerateScenariosRequest = z.object({
  promptVersionId: z.string(),
  suiteName: z.string().optional(),
  scenarioTypes: z.array(ScenarioType).optional(),
  count: z.number().positive().optional(),
})
export type GenerateScenariosRequest = z.infer<typeof GenerateScenariosRequest>

export const RunEvalRequest = z.object({
  suiteId: z.string(),
  providers: z.array(z.string()),
  config: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().optional(),
  }).optional(),
})
export type RunEvalRequest = z.infer<typeof RunEvalRequest>

// Utility types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error types
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public model: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class EvaluationError extends Error {
  constructor(message: string, public scenarioId?: string) {
    super(message)
    this.name = 'EvaluationError'
  }
}
