const axios = require('axios');

class LLMClient {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
  }

  async chat(messages, systemPrompt = null) {
    try {
      switch (this.provider) {
        case 'openai':
          return await this.openaiChat(messages, systemPrompt);
        case 'cohere':
          return await this.cohereChat(messages, systemPrompt);
        case 'local':
          return await this.localChat(messages, systemPrompt);
        default:
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('LLM Chat Error:', error.message);
      throw error;
    }
  }

  async openaiChat(messages, systemPrompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const formattedMessages = [];

    if (systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    formattedMessages.push(...messages);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  async cohereChat(messages, systemPrompt) {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      throw new Error('COHERE_API_KEY not configured');
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    const response = await axios.post('https://api.cohere.com/generate', {
      prompt: lastMessage,
      max_tokens: 500,
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.generations[0].text.trim();
  }

  async localChat(messages, systemPrompt) {
    // For local LLM (e.g., Ollama, LLaMA)
    const localLLMUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434/api/generate';

    const lastMessage = messages[messages.length - 1]?.content || '';
    const prompt = systemPrompt ? `${systemPrompt}\n\n${lastMessage}` : lastMessage;

    const response = await axios.post(localLLMUrl, {
      model: process.env.LOCAL_MODEL || 'llama2',
      prompt: prompt,
      stream: false
    });

    return response.data.response;
  }
}

module.exports = new LLMClient();
