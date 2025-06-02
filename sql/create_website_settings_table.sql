CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    input_type TEXT DEFAULT 'text', -- Added to help render form: 'text', 'boolean', 'number', 'textarea', 'color'
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id)
);

-- Optional: Add some initial settings
-- Note: Ensure the user ID for 'updated_by' exists or set it to NULL if appropriate for initial seeding.
-- You might want to create a dedicated seed script or handle initial settings creation via the app.
-- Example (replace 'your_admin_user_id' with an actual admin user ID from your users table):
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Attempt to get an admin user ID. Replace with a specific ID if known.
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.website_settings (key, value, category, description, input_type, updated_by)
    VALUES
      ('siteName', '"Cyberpunk Web Shell Hub"', 'General', 'The public name of the website.', 'text', admin_user_id),
      ('maintenanceMode', 'false', 'General', 'Enable to show a maintenance page to non-admin users.', 'boolean', admin_user_id),
      ('registrationOpen', 'true', 'General', 'Allow new users to register.', 'boolean', admin_user_id),
      ('defaultUserRole', '"client"', 'General', 'Default role assigned to new users upon registration.', 'text', admin_user_id),
      ('primaryColor', '"#00ff9d"', 'Theme', 'Main accent color for the website theme.', 'color', admin_user_id),
      ('footerText', '"© 2025 TRX Network. All rights reserved."', 'Content', 'Text displayed in the website footer.', 'textarea', admin_user_id)
    ON CONFLICT (key) DO NOTHING;
  ELSE
    RAISE NOTICE 'Admin user ID not found, skipping initial settings seed for website_settings.';
  END IF;
END $$;
