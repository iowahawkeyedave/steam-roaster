/**
 * Test OpenRouter API connection
 * Run with: npx tsx test-openrouter.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local file manually
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && !key.startsWith('#') && value) {
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not load .env.local file');
  }
}

loadEnv();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not found in environment variables');
  console.error('❌ Make sure you have a .env.local file with your API key');
  process.exit(1);
}

async function testOpenRouter() {
  console.log('🔌 Testing OpenRouter API connection...\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Steam Roaster',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a witty gaming assistant.',
          },
          {
            role: 'user',
            content: 'Give me a one-sentence roast for someone who has played 500 hours of Euro Truck Simulator.',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      console.error(error);
      process.exit(1);
    }

    const data = await response.json();

    console.log('✅ Connection successful!\n');
    console.log('📝 Roast:', data.choices[0].message.content);
    console.log('\n📊 Model used:', data.model);
    console.log('💰 Tokens used:', data.usage?.total_tokens || 'N/A');
    console.log('\n🎉 Your OpenRouter API key is working!');
    console.log('✅ Issue #2 (OpenRouter setup) is ready to be marked complete!');

  } catch (error) {
    console.error('❌ Error connecting to OpenRouter:', error);
    process.exit(1);
  }
}

testOpenRouter();
