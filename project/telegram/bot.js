const { Telegraf, session } = require('telegraf');
const llmClient = require('./llmClient');

class TelegramLLMBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.conversationContexts = new Map();
    this.setupMiddleware();
    this.setupHandlers();
  }

  setupMiddleware() {
    this.bot.use(session());
  }

  setupHandlers() {
    // Start command
    this.bot.start((ctx) => {
      const welcomeMessage = `
🤖 Welcome to LLM Chat Bot!

I'm an AI assistant powered by ${process.env.LLM_PROVIDER || 'OpenAI'}.

Available commands:
/help - Show help message
/clear - Clear conversation history
/status - Check bot status
/model - Show current LLM model

Just send me a message and I'll respond!
      `;
      ctx.reply(welcomeMessage);
    });

    // Help command
    this.bot.help((ctx) => {
      ctx.reply(`
🔧 Commands:
/help - Show this message
/clear - Clear conversation history
/status - Check bot status
/model - Show current model info
/settings - Configure bot settings

Just send any message to chat with the AI!
      `);
    });

    // Clear conversation
    this.bot.command('clear', (ctx) => {
      const userId = ctx.from.id;
      this.conversationContexts.delete(userId);
      ctx.reply('✅ Conversation history cleared!');
    });

    // Status command
    this.bot.command('status', (ctx) => {
      const provider = process.env.LLM_PROVIDER || 'unknown';
      const model = process.env.OPENAI_MODEL || 'unknown';
      const userId = ctx.from.id;
      const hasContext = this.conversationContexts.has(userId);

      ctx.reply(`
📊 Bot Status:
✅ Bot is running
🔌 LLM Provider: ${provider}
📦 Model: ${model}
💬 Conversation Active: ${hasContext ? 'Yes' : 'No'}
      `);
    });

    // Model info command
    this.bot.command('model', (ctx) => {
      const provider = process.env.LLM_PROVIDER || 'openai';
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      ctx.reply(`
📦 Current Model Configuration:
Provider: ${provider}
Model: ${model}
      `);
    });

    // Handle all text messages
    this.bot.on('text', async (ctx) => {
      try {
        // Show typing indicator
        await ctx.sendChatAction('typing');

        const userId = ctx.from.id;
        const userMessage = ctx.message.text;

        // Get or initialize conversation context
        if (!this.conversationContexts.has(userId)) {
          this.conversationContexts.set(userId, []);
        }

        const messages = this.conversationContexts.get(userId);

        // Add user message to context
        messages.push({
          role: 'user',
          content: userMessage
        });

        // Keep only last 10 messages to avoid context overflow
        if (messages.length > 20) {
          messages.shift();
        }

        // Call LLM
        const systemPrompt = 'You are a helpful AI assistant. Provide concise and accurate responses.';
        const response = await llmClient.chat(messages, systemPrompt);

        // Add assistant response to context
        messages.push({
          role: 'assistant',
          content: response
        });

        // Split response if too long (Telegram limit is 4096)
        if (response.length > 4096) {
          const chunks = this.splitMessage(response, 4096);
          for (const chunk of chunks) {
            await ctx.reply(chunk);
          }
        } else {
          await ctx.reply(response);
        }
      } catch (error) {
        console.error('Message handling error:', error);
        ctx.reply('❌ Sorry, I encountered an error. Please try again later.');
      }
    });

    // Handle other message types
    this.bot.on('photo', (ctx) => {
      ctx.reply('📸 I currently only support text messages. Please send a text message instead!');
    });

    this.bot.on('document', (ctx) => {
      ctx.reply('📄 I currently only support text messages. Please send a text message instead!');
    });
  }

  splitMessage(message, maxLength) {
    const chunks = [];
    for (let i = 0; i < message.length; i += maxLength) {
      chunks.push(message.substring(i, i + maxLength));
    }
    return chunks;
  }

  launch() {
    this.bot.launch();
    console.log('🤖 Telegram LLM Bot started!');
    
    // Graceful shutdown
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  getBot() {
    return this.bot;
  }
}

module.exports = TelegramLLMBot;
