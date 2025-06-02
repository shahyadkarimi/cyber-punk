-- Update the auth settings to disable email confirmation
-- This needs to be run in the Supabase SQL editor or via the dashboard

-- Disable email confirmation requirement
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Allow users to sign in without email confirmation
UPDATE auth.config 
SET email_autoconfirm = true 
WHERE id = 1;

-- Update the user creation trigger to set email_confirmed_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, username, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  
  -- Auto-confirm the email
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
