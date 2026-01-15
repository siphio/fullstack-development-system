/**
 * Create test user for Playwright validation
 * Run: tsx scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER = {
  email: 'test@taskflow.dev',
  password: 'TestPassword123!',
};

async function createTestUser() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Creating test user...');
  console.log('Email:', TEST_USER.email);
  console.log('Supabase URL:', supabaseUrl);

  // Try to sign up the user
  const { data, error } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('✅ Test user already exists');
      return;
    }
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }

  console.log('✅ Test user created successfully');
  console.log('User ID:', data.user?.id);
}

createTestUser().catch(console.error);
