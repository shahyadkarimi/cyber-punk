import { supabase } from "./supabase"

export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.rpc("create_table_if_not_exists", {
      p_table_name: "users",
      p_column_definitions: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE
      `,
    })

    if (usersError) throw new Error(`Error creating users table: ${usersError.message}`)

    // Create web_shells table if it doesn't exist
    const { error: shellsError } = await supabase.rpc("create_table_if_not_exists", {
      p_table_name: "web_shells",
      p_column_definitions: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        author_id UUID REFERENCES users(id),
        downloads INTEGER DEFAULT 0,
        rating FLOAT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE
      `,
    })

    if (shellsError) throw new Error(`Error creating web_shells table: ${shellsError.message}`)

    // Create exploits table if it doesn't exist
    const { error: exploitsError } = await supabase.rpc("create_table_if_not_exists", {
      p_table_name: "exploits",
      p_column_definitions: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        code TEXT NOT NULL,
        target_system TEXT NOT NULL,
        cve_id TEXT,
        severity TEXT NOT NULL,
        author_id UUID REFERENCES users(id),
        tags TEXT[] DEFAULT '{}',
        is_verified BOOLEAN DEFAULT FALSE
      `,
    })

    if (exploitsError) throw new Error(`Error creating exploits table: ${exploitsError.message}`)

    // Create vulnerability_scans table if it doesn't exist
    const { error: scansError } = await supabase.rpc("create_table_if_not_exists", {
      p_table_name: "vulnerability_scans",
      p_column_definitions: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        target_url TEXT NOT NULL,
        scan_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        results JSONB DEFAULT '{}'::jsonb,
        user_id UUID REFERENCES users(id),
        completed_at TIMESTAMP WITH TIME ZONE
      `,
    })

    if (scansError) throw new Error(`Error creating vulnerability_scans table: ${scansError.message}`)

    // Create activity_logs table if it doesn't exist
    const { error: logsError } = await supabase.rpc("create_table_if_not_exists", {
      p_table_name: "activity_logs",
      p_column_definitions: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID REFERENCES users(id),
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details JSONB
      `,
    })

    if (logsError) throw new Error(`Error creating activity_logs table: ${logsError.message}`)

    // Create domains table if it doesn't exist
    const { error: domainsError } = await supabase.rpc("create_table_if_not_exists", {
      p_table_name: "domains",
      p_column_definitions: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        domain TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        ip_address TEXT,
        registrar TEXT,
        creation_date TIMESTAMP WITH TIME ZONE,
        expiration_date TIMESTAMP WITH TIME ZONE,
        da_score FLOAT,
        pa_score FLOAT,
        tags TEXT[] DEFAULT '{}',
        user_id UUID REFERENCES users(id)
      `,
    })

    if (domainsError) throw new Error(`Error creating domains table: ${domainsError.message}`)

    console.log("Database initialization completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Database initialization failed:", error)
    return { success: false, error }
  }
}
