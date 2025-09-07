-- PromptFix Database Schema
-- Run this SQL in your Supabase SQL editor to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create evaluation_runs table
CREATE TABLE IF NOT EXISTS evaluation_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    results JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    total_cost DECIMAL(10, 6),
    total_tokens INTEGER
);

-- Create scenario_suites table
CREATE TABLE IF NOT EXISTS scenario_suites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    scenarios JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create prompt_versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    changes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(project_id, version_number)
);

-- Create security_scans table
CREATE TABLE IF NOT EXISTS security_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    vulnerabilities JSONB DEFAULT '[]',
    summary JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create model_adapters table
CREATE TABLE IF NOT EXISTS model_adapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    adapted_prompt TEXT NOT NULL,
    changes JSONB DEFAULT '[]',
    analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_runs_project_id ON evaluation_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_scenario_suites_project_id ON scenario_suites(project_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_project_id ON prompt_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_project_id ON security_scans(project_id);
CREATE INDEX IF NOT EXISTS idx_model_adapters_project_id ON model_adapters(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_runs_updated_at BEFORE UPDATE ON evaluation_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_suites_updated_at BEFORE UPDATE ON scenario_suites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_scans_updated_at BEFORE UPDATE ON security_scans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_adapters ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Evaluation runs policies
CREATE POLICY "Users can view evaluation runs for their projects" ON evaluation_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = evaluation_runs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert evaluation runs for their projects" ON evaluation_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = evaluation_runs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update evaluation runs for their projects" ON evaluation_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = evaluation_runs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Pipeline runs table for tracking complete auto-pipeline executions
CREATE TABLE pipeline_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB,
    status TEXT DEFAULT 'completed',
    summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for pipeline_runs
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Similar policies for other tables
CREATE POLICY "Users can manage pipeline runs for their projects" ON pipeline_runs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = pipeline_runs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage scenario suites for their projects" ON scenario_suites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = scenario_suites.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage prompt versions for their projects" ON prompt_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = prompt_versions.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage security scans for their projects" ON security_scans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = security_scans.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage model adapters for their projects" ON model_adapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = model_adapters.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Insert some sample data (optional)
INSERT INTO projects (name, description, system_prompt, user_id) VALUES 
('Sample Customer Support Bot', 'A customer support chatbot for e-commerce', 'You are a helpful customer support assistant for an e-commerce platform. Your role is to help customers with order inquiries, returns, and general questions. Provide accurate information about products and services, escalate complex issues to human agents when necessary, and maintain a friendly and professional tone.', NULL),
('Code Review Assistant', 'AI assistant for code review and suggestions', 'You are an expert code reviewer. Analyze code for bugs, security issues, performance problems, and best practices. Provide constructive feedback with specific suggestions for improvement. Focus on maintainability, readability, and following language-specific conventions.', NULL),
('Content Writing Helper', 'AI assistant for content creation and editing', 'You are a professional content writer and editor. Help users create engaging, well-structured content for blogs, articles, and marketing materials. Ensure proper grammar, tone consistency, and SEO optimization while maintaining the user''s unique voice and style.', NULL)
ON CONFLICT DO NOTHING;
