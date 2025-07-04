"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function createDatabaseTables() {
  try {
    console.log("Starting database table creation...")

    // Create users table
    const { error: usersError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
          is_active BOOLEAN DEFAULT TRUE,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (usersError) {
      console.error("Error creating users table:", usersError)
      // Try alternative approach
      const { error: altUsersError } = await supabaseAdmin.from("users").select("id").limit(1)

      if (altUsersError && altUsersError.code === "42P01") {
        // Table doesn't exist, create it manually
        return {
          success: false,
          error: "Cannot create tables automatically. Please create them manually in Supabase dashboard.",
          instructions: getManualInstructions(),
        }
      }
    }

    // Create web_shells table
    const { error: shellsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS web_shells (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          language TEXT NOT NULL,
          category TEXT NOT NULL,
          tags TEXT[] DEFAULT '{}',
          download_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          uploaded_by UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Create exploits table
    const { error: exploitsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS exploits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          code TEXT NOT NULL,
          target_system TEXT NOT NULL,
          cve_id TEXT,
          severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
          author_id UUID REFERENCES users(id),
          tags TEXT[] DEFAULT '{}',
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Create vulnerability_scans table
    const { error: scansError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS vulnerability_scans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          target_url TEXT NOT NULL,
          scan_type TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
          results JSONB DEFAULT '{}'::jsonb,
          user_id UUID REFERENCES users(id),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Create activity_logs table
    const { error: logsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          action TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Create domains table
    const { error: domainsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS domains (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain TEXT UNIQUE NOT NULL,
          status TEXT DEFAULT 'active',
          ip_address TEXT,
          registrar TEXT,
          creation_date TIMESTAMP WITH TIME ZONE,
          expiration_date TIMESTAMP WITH TIME ZONE,
          da_score FLOAT,
          pa_score FLOAT,
          tags TEXT[] DEFAULT '{}',
          user_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Check for any errors
    const errors = [usersError, shellsError, exploitsError, scansError, logsError, domainsError].filter(Boolean)

    if (errors.length > 0) {
      console.error("Some tables failed to create:", errors)
      return {
        success: false,
        error: "Some tables failed to create. Please check the manual instructions.",
        instructions: getManualInstructions(),
      }
    }

    console.log("All tables created successfully!")
    return { success: true, message: "All database tables created successfully!" }
  } catch (error: any) {
    console.error("Database initialization error:", error)
    return {
      success: false,
      error: error.message || "Failed to create database tables",
      instructions: getManualInstructions(),
    }
  }
}

function getManualInstructions() {
  return `
Please create these tables manually in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run these SQL commands one by one:

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Web shells table
CREATE TABLE web_shells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  language TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exploits table
CREATE TABLE exploits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  target_system TEXT NOT NULL,
  cve_id TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  author_id UUID REFERENCES users(id),
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vulnerability scans table
CREATE TABLE vulnerability_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains table
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  ip_address TEXT,
  registrar TEXT,
  creation_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  da_score FLOAT,
  pa_score FLOAT,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
  `
}

export async function insertSampleData() {
  try {
    console.log("Inserting sample data...")

    // Insert sample user
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: "admin@XTeamSecurity.com",
          username: "trxadmin",
          full_name: "TRX Administrator",
          role: "admin",
        },
        {
          email: "user@example.com",
          username: "testuser",
          full_name: "Test User",
          role: "user",
        },
      ])
      .select()

    if (userError) {
      console.error("Error inserting users:", userError)
    }

    // Insert sample web shell
    const { error: shellError } = await supabaseAdmin.from("web_shells").insert([
      {
        name: "Simple PHP Shell",
        description: "A basic PHP web shell for testing purposes",
        file_path: "/shells/simple.php",
        language: "php",
        category: "basic",
        tags: ["php", "basic", "testing"],
      },
    ])

    if (shellError) {
      console.error("Error inserting web shells:", shellError)
    }

    // Insert sample exploit
    const { error: exploitError } = await supabaseAdmin.from("exploits").insert([
      {
        name: "SQL Injection Example",
        description: "Basic SQL injection demonstration",
        code: "' OR 1=1 --",
        target_system: "MySQL",
        severity: "high",
        tags: ["sql", "injection", "database"],
      },
    ])

    if (exploitError) {
      console.error("Error inserting exploits:", exploitError)
    }

    return { success: true, message: "Sample data inserted successfully!" }
  } catch (error: any) {
    console.error("Error inserting sample data:", error)
    return { success: false, error: error.message || "Failed to insert sample data" }
  }
}
