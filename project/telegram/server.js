require('dotenv').config();
const express = require('express');
const TelegramLLMBot = require('./bot');
const llmClient = require('./llmClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Telegram bot
const bot = new TelegramLLMBot();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Telegram LLM Bot API',
    provider: process.env.LLM_PROVIDER || 'openai',
    timestamp: new Date().toISOString()
  });
});

// API endpoint to chat with LLM directly (without Telegram)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request. "messages" array is required.'
      });
    }

    const response = await llmClient.chat(messages, systemPrompt);

    res.json({
      success: true,
      response: response,
      provider: process.env.LLM_PROVIDER,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint for single message
app.post('/api/message', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. "message" string is required.'
      });
    }

    const messages = [
      {
        role: 'user',
        content: message
      }
    ];

    const response = await llmClient.chat(messages, systemPrompt);

    res.json({
      success: true,
      message: message,
      response: response,
      provider: process.env.LLM_PROVIDER,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Message API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Telegram webhook endpoint
app.post('/telegram/webhook', express.json(), (req, res) => {
  bot.getBot().handleUpdate(req.body, res);
});

// Bot info endpoint
app.get('/api/bot/info', (req, res) => {
  res.json({
    name: 'Telegram LLM Bot',
    version: '1.0.0',
    provider: process.env.LLM_PROVIDER || 'openai',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      message: '/api/message',
      botInfo: '/api/bot/info'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Telegram LLM Bot API started!
📍 Server running on http://localhost:${PORT}
🤖 LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}
📦 Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}

Available endpoints:
  GET  /health - Health check
  GET  /api/bot/info - Bot information
  POST /api/message - Send a single message
  POST /api/chat - Send chat with history
  POST /telegram/webhook - Telegram webhook
  `);
});

// Launch bot (polling mode for development)
bot.launch();

module.exports = app;
