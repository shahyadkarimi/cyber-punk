-- Insert sample website settings
INSERT INTO public.website_settings (key, value, category, description, is_public) VALUES
-- General Settings
('site_name', '"TRX Cyberpunk Hub"', 'general', 'Website name displayed in header and title', true),
('site_description', '"Advanced cyberpunk tools and web shell marketplace"', 'general', 'Website description for SEO and meta tags', true),
('contact_email', '"admin@trxcyberpunk.com"', 'general', 'Main contact email address', true),
('maintenance_mode', 'false', 'general', 'Enable maintenance mode to disable site access', false),
('registration_enabled', 'true', 'general', 'Allow new user registrations', false),
('max_users', '1000', 'general', 'Maximum number of users allowed', false),

-- Theme Settings
('primary_color', '"#00ff9d"', 'theme', 'Primary brand color', true),
('secondary_color', '"#1a1a2e"', 'theme', 'Secondary background color', true),
('accent_color', '"#ff6b6b"', 'theme', 'Accent color for highlights', true),
('dark_mode_enabled', 'true', 'theme', 'Enable dark mode by default', true),
('cyberpunk_effects', 'true', 'theme', 'Enable cyberpunk visual effects', true),
('logo_url', '"/logo.png"', 'theme', 'Website logo URL', true),

-- Security Settings
('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout', false),
('session_timeout', '3600', 'security', 'Session timeout in seconds', false),
('require_email_verification', 'true', 'security', 'Require email verification for new accounts', false),
('password_min_length', '8', 'security', 'Minimum password length', false),
('enable_2fa', 'false', 'security', 'Enable two-factor authentication', false),

-- Payment Settings
('payment_enabled', 'true', 'payment', 'Enable payment processing', false),
('min_deposit', '10', 'payment', 'Minimum deposit amount', false),
('max_deposit', '10000', 'payment', 'Maximum deposit amount', false),
('transaction_fee', '0.05', 'payment', 'Transaction fee percentage', false),
('withdrawal_enabled', 'true', 'payment', 'Enable withdrawals', false),

-- Email Settings
('smtp_host', '"smtp.gmail.com"', 'email', 'SMTP server host', false),
('smtp_port', '587', 'email', 'SMTP server port', false),
('smtp_username', '""', 'email', 'SMTP username', false),
('smtp_password', '""', 'email', 'SMTP password', false),
('from_email', '"noreply@trxcyberpunk.com"', 'email', 'From email address', false),
('from_name', '"TRX Cyberpunk Hub"', 'email', 'From name for emails', false),

-- Users Settings
('default_user_role', '"client"', 'users', 'Default role for new users', false),
('allow_role_change', 'false', 'users', 'Allow users to change their role', false),
('profile_picture_enabled', 'true', 'users', 'Allow profile picture uploads', false),
('max_profile_picture_size', '5242880', 'users', 'Maximum profile picture size in bytes (5MB)', false)

ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  updated_at = NOW();
