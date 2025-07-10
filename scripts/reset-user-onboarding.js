import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetUserOnboarding(userEmail) {
  try {
    // Find user by email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
    
    if (userError || !user) {
      console.error('User not found:', userError?.message);
      return;
    }

    // Clear brand information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        brand_name: null,
        brand_description: null
      })
      .eq('id', user.user.id);

    if (updateError) {
      console.error('Error clearing brand info:', updateError.message);
      return;
    }

    console.log(`✅ Successfully cleared brand information for ${userEmail}`);
    console.log('The user will now see the onboarding screen on their next login.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node scripts/reset-user-onboarding.js <user-email>');
  console.log('Example: node scripts/reset-user-onboarding.js user@example.com');
  process.exit(1);
}

resetUserOnboarding(userEmail); 