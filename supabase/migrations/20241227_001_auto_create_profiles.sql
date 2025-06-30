-- Migration to auto-create profiles when users sign up
-- This prevents foreign key constraint violations

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, company_name, subscription_status)
  VALUES (NEW.id, NEW.email, NULL, NULL, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT INSERT ON public.profiles TO postgres, service_role; 