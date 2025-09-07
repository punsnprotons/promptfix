import { supabase, Database } from './supabase'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type EvaluationRun = Database['public']['Tables']['evaluation_runs']['Row']
export type EvaluationRunInsert = Database['public']['Tables']['evaluation_runs']['Insert']
export type EvaluationRunUpdate = Database['public']['Tables']['evaluation_runs']['Update']

export type ScenarioSuite = Database['public']['Tables']['scenario_suites']['Row']
export type ScenarioSuiteInsert = Database['public']['Tables']['scenario_suites']['Insert']

export type PromptVersion = Database['public']['Tables']['prompt_versions']['Row']
export type PromptVersionInsert = Database['public']['Tables']['prompt_versions']['Insert']

// Projects
export async function getProjects(): Promise<(Project & { 
  _count: { 
    evalRuns: number; 
    scenarioSuites: number; 
    promptVersions: number; 
  }
})[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      evaluation_runs!inner(count),
      scenario_suites!inner(count),
      prompt_versions!inner(count)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  // Transform the data to match expected format
  const transformedData = await Promise.all(
    (data || []).map(async (project) => {
      // Get actual counts since Supabase count aggregation might not work as expected
      const [evalRuns, scenarioSuites, promptVersions] = await Promise.all([
        supabase.from('evaluation_runs').select('id', { count: 'exact' }).eq('project_id', project.id),
        supabase.from('scenario_suites').select('id', { count: 'exact' }).eq('project_id', project.id),
        supabase.from('prompt_versions').select('id', { count: 'exact' }).eq('project_id', project.id)
      ])

      return {
        ...project,
        _count: {
          evalRuns: evalRuns.count || 0,
          scenarioSuites: scenarioSuites.count || 0,
          promptVersions: promptVersions.count || 0
        }
      }
    })
  )

  return transformedData
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export async function createProject(project: ProjectInsert): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return null
  }

  return data
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return null
  }

  return data
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}

// Evaluation Runs
export async function getEvaluationRuns(projectId: string): Promise<EvaluationRun[]> {
  const { data, error } = await supabase
    .from('evaluation_runs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching evaluation runs:', error)
    return []
  }

  return data || []
}

export async function createEvaluationRun(run: EvaluationRunInsert): Promise<EvaluationRun | null> {
  const { data, error } = await supabase
    .from('evaluation_runs')
    .insert(run)
    .select()
    .single()

  if (error) {
    console.error('Error creating evaluation run:', error)
    return null
  }

  return data
}

export async function updateEvaluationRun(id: string, updates: EvaluationRunUpdate): Promise<EvaluationRun | null> {
  const { data, error } = await supabase
    .from('evaluation_runs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating evaluation run:', error)
    return null
  }

  return data
}

// Scenario Suites
export async function getScenarioSuites(projectId: string): Promise<ScenarioSuite[]> {
  const { data, error } = await supabase
    .from('scenario_suites')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching scenario suites:', error)
    return []
  }

  return data || []
}

export async function createScenarioSuite(suite: ScenarioSuiteInsert): Promise<ScenarioSuite | null> {
  const { data, error } = await supabase
    .from('scenario_suites')
    .insert(suite)
    .select()
    .single()

  if (error) {
    console.error('Error creating scenario suite:', error)
    return null
  }

  return data
}

// Prompt Versions
export async function getPromptVersions(projectId: string): Promise<PromptVersion[]> {
  const { data, error } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('Error fetching prompt versions:', error)
    return []
  }

  return data || []
}

export async function createPromptVersion(version: PromptVersionInsert): Promise<PromptVersion | null> {
  const { data, error } = await supabase
    .from('prompt_versions')
    .insert(version)
    .select()
    .single()

  if (error) {
    console.error('Error creating prompt version:', error)
    return null
  }

  return data
}

// Security Scans
export async function createSecurityScan(scan: {
  project_id: string
  name: string
  status: string
  vulnerabilities?: any
  summary?: any
}): Promise<any> {
  const { data, error } = await supabase
    .from('security_scans')
    .insert(scan)
    .select()
    .single()

  if (error) {
    console.error('Error creating security scan:', error)
    return null
  }

  return data
}

export async function updateSecurityScan(id: string, updates: {
  status?: string
  vulnerabilities?: any
  summary?: any
}): Promise<any> {
  const { data, error } = await supabase
    .from('security_scans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating security scan:', error)
    return null
  }

  return data
}

// Model Adapters
export async function createModelAdapter(adapter: {
  project_id: string
  provider: string
  model: string
  original_prompt: string
  adapted_prompt: string
  changes?: any
  analysis?: any
}): Promise<any> {
  const { data, error } = await supabase
    .from('model_adapters')
    .insert(adapter)
    .select()
    .single()

  if (error) {
    console.error('Error creating model adapter:', error)
    return null
  }

  return data
}

export async function getModelAdapters(projectId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('model_adapters')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching model adapters:', error)
    return []
  }

  return data || []
}

// Utility functions
export async function getProjectStats(projectId: string) {
  const [evalRuns, scenarios, versions] = await Promise.all([
    getEvaluationRuns(projectId),
    getScenarioSuites(projectId),
    getPromptVersions(projectId)
  ])

  return {
    evalRuns: evalRuns.length,
    scenarios: scenarios.length,
    versions: versions.length,
    lastRun: evalRuns[0]?.created_at || null
  }
}
