-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Disable RLS temporarily to recreate policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for admins that works
CREATE POLICY "Admin full access" ON public.users
    FOR ALL USING (
        -- Allow if user is admin (check auth.jwt() for role)
        (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin') OR
        -- Or if there's an admin user with this auth.uid()
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        ) OR
        -- Allow users to see their own profile
        (auth.uid() = id)
    );

-- Create policy for user registration
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO anon;
