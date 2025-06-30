-- Rename users table to profiles
ALTER TABLE users RENAME TO profiles;

-- Update foreign key constraints (they should automatically update, but let's be explicit)
-- The foreign key references will automatically point to the renamed table

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Update function triggers (they should still work with the renamed table)
DROP TRIGGER IF EXISTS update_users_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update indexes (they should automatically be renamed, but let's be explicit)
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_deleted_at;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL; 