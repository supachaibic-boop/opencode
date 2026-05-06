/**
 * Test client for Telegram LLM Bot API
 * Run this to test the API endpoints
 * 
 * Usage: node test-client.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testHealthCheck() {
  try {
    console.log('\n📊 Testing Health Check...');
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testBotInfo() {
  try {
    console.log('\n📊 Testing Bot Info...');
    const response = await axios.get(`${API_URL}/api/bot/info`);
    console.log('✅ Bot info:', response.data);
  } catch (error) {
    console.error('❌ Bot info failed:', error.message);
  }
}

async function testSingleMessage() {
  try {
    console.log('\n💬 Testing Single Message...');
    const response = await axios.post(`${API_URL}/api/message`, {
      message: 'What is artificial intelligence?',
      systemPrompt: 'You are an expert in AI and machine learning.'
    });
    console.log('✅ Response:', response.data.response);
  } catch (error) {
    console.error('❌ Single message test failed:', error.message);
  }
}

async function testMultiTurnChat() {
  try {
    console.log('\n🔄 Testing Multi-turn Chat...');
    const response = await axios.post(`${API_URL}/api/chat`, {
      messages: [
        { role: 'user', content: 'What is machine learning?' },
        { role: 'assistant', content: 'Machine learning is a subset of artificial intelligence where systems learn from data without being explicitly programmed.' },
        { role: 'user', content: 'Can you give me a practical example?' }
      ],
      systemPrompt: 'You are a helpful AI tutor.'
    });
    console.log('✅ Response:', response.data.response);
  } catch (error) {
    console.error('❌ Multi-turn chat test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting Telegram LLM Bot API Tests...\n');

  await testHealthCheck();
  await testBotInfo();
  await testSingleMessage();
  await testMultiTurnChat();

  console.log('\n✅ All tests completed!');
}

// Run tests
runAllTests().catch(err => console.error('Test suite error:', err));
