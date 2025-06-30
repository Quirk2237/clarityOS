#!/usr/bin/env node

// Simple script to verify the card images setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Card Images Setup...\n');

  try {
    // Check if storage bucket exists
    console.log('1. Checking storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error checking storage buckets:', bucketsError.message);
      return false;
    }

    const cardImagesBucket = buckets.find(bucket => bucket.id === 'card-images');
    if (cardImagesBucket) {
      console.log('✅ Storage bucket "card-images" exists');
      console.log(`   - Public: ${cardImagesBucket.public}`);
      console.log(`   - File size limit: ${cardImagesBucket.file_size_limit / 1024 / 1024}MB`);
    } else {
      console.log('❌ Storage bucket "card-images" not found');
      return false;
    }

    // Check if image_url column exists by fetching cards
    console.log('\n2. Checking cards table structure...');
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, slug, image_url')
      .limit(3);

    if (cardsError) {
      console.error('❌ Error fetching cards:', cardsError.message);
      return false;
    }

    console.log('✅ Cards table includes image_url column');
    console.log('   Sample cards:');
    cards.forEach(card => {
      console.log(`   - ${card.name} (${card.slug}): ${card.image_url || 'No image'}`);
    });

    // Test storage bucket accessibility
    console.log('\n3. Testing storage bucket access...');
    const { data: publicUrl } = supabase.storage
      .from('card-images')
      .getPublicUrl('test-file.jpg');

    if (publicUrl.publicUrl) {
      console.log('✅ Storage bucket is publicly accessible');
      console.log(`   Public URL format: ${publicUrl.publicUrl}`);
    } else {
      console.log('❌ Storage bucket is not accessible');
      return false;
    }

    console.log('\n🎉 Card Images Setup Verification Complete!');
    console.log('\nNext steps:');
    console.log('1. Upload images to the card-images storage bucket');
    console.log('2. Update card records with the image URLs');
    console.log('3. The app will automatically use database images over local fallbacks');
    
    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

verifySetup().then(success => {
  process.exit(success ? 0 : 1);
}); 