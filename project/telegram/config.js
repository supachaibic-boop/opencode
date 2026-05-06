/**
 * Configuration management for Telegram LLM Bot
 */

const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.WEBHOOK_URL
  },
  
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000
    },
    
    cohere: {
      apiKey: process.env.COHERE_API_KEY,
      model: 'command',
      maxTokens: 500
    },
    
    local: {
      url: process.env.LOCAL_LLM_URL || 'http://localhost:11434/api/generate',
      model: process.env.LOCAL_MODEL || 'llama2'
    }
  },
  
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  conversation: {
    maxContextMessages: 20,
    defaultSystemPrompt: 'You are a helpful AI assistant. Provide concise and accurate responses.'
  }
};

// Validation
function validateConfig() {
  const errors = [];

  if (!config.telegram.botToken) {
    errors.push('TELEGRAM_BOT_TOKEN is required');
  }

  if (config.llm.provider === 'openai' && !config.llm.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required for OpenAI provider');
  }

  if (config.llm.provider === 'cohere' && !config.llm.cohere.apiKey) {
    errors.push('COHERE_API_KEY is required for Cohere provider');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error('  ❌ ' + err));
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
}

module.exports = {
  config,
  validateConfig
};
