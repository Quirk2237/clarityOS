import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Key:', supabaseAnonKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔗 Testing basic connection...');
    
    // Test basic query
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Cards found:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('🗂️ Sample cards:');
      data.forEach(card => {
        console.log(`  - ${card.name} (${card.slug}) - Active: ${card.is_active}`);
      });
    } else {
      console.log('⚠️ No cards found in database');
    }
    
    // Test with sections
    console.log('\n🔍 Testing cards with sections...');
    const { data: cardsWithSections, error: sectionsError } = await supabase
      .from('cards')
      .select(`
        *,
        card_sections (
          id,
          name,
          type
        )
      `)
      .eq('is_active', true)
      .limit(3);
    
    if (sectionsError) {
      console.error('❌ Sections query error:', sectionsError);
      return;
    }
    
    console.log('✅ Cards with sections query successful!');
    console.log('📊 Cards with sections:', cardsWithSections?.length || 0);
    
    if (cardsWithSections && cardsWithSections.length > 0) {
      cardsWithSections.forEach(card => {
        console.log(`  - ${card.name}: ${card.card_sections?.length || 0} sections`);
      });
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

testConnection(); 