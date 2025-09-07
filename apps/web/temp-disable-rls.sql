-- Temporary script to disable RLS for testing authentication
-- Run this in your Supabase SQL editor to allow public access for testing

-- Temporarily allow public access to projects table
CREATE POLICY "Allow public access to projects for testing" ON projects FOR ALL USING (TRUE);

-- Temporarily allow public access to other tables  
CREATE POLICY "Allow public access to evaluation_runs for testing" ON evaluation_runs FOR ALL USING (TRUE);
CREATE POLICY "Allow public access to scenario_suites for testing" ON scenario_suites FOR ALL USING (TRUE);
CREATE POLICY "Allow public access to prompt_versions for testing" ON prompt_versions FOR ALL USING (TRUE);
CREATE POLICY "Allow public access to security_scans for testing" ON security_scans FOR ALL USING (TRUE);
CREATE POLICY "Allow public access to model_adapters for testing" ON model_adapters FOR ALL USING (TRUE);

-- Note: These are temporary policies for testing. In production, you should use proper user-based policies.
