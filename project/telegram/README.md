# Telegram LLM Chat Bot API

A powerful Telegram bot that integrates with Large Language Models (LLM) to provide AI-powered conversations directly on Telegram.

## Features

✨ **Key Features:**
- 🤖 Telegram bot integration with LLM services
- 💬 Multi-turn conversation support
- 🔄 Support for multiple LLM providers (OpenAI, Cohere, Local LLMs)
- 🚀 Express API server with REST endpoints
- 📊 Conversation history management
- 🔌 Easy provider switching
- 💾 Context-aware responses

## Supported LLM Providers

- **OpenAI** - GPT-3.5-turbo, GPT-4
- **Cohere** - Cohere API
- **Local LLMs** - Ollama, LLaMA, etc.

## Prerequisites

- Node.js 14+ and npm
- Telegram Bot Token (from @BotFather on Telegram)
- LLM API Key (OpenAI, Cohere, or local LLM endpoint)

## Installation

1. **Clone and setup:**
```bash
cd project/telegram
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Set your environment variables:**

**For OpenAI:**
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
PORT=3000
```

**For Local LLM (Ollama):**
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
LLM_PROVIDER=local
LOCAL_LLM_URL=http://localhost:11434/api/generate
LOCAL_MODEL=llama2
PORT=3000
```

## Usage

### Start the bot (Development)

```bash
npm start
```

The bot will start in polling mode and listen for incoming messages.

### Development with auto-reload

```bash
npm run dev
```

Requires `nodemon` (already in devDependencies).

## API Endpoints

### 1. Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "ok",
  "service": "Telegram LLM Bot API",
  "provider": "openai",
  "timestamp": "2024-05-06T10:30:00Z"
}
```

### 2. Single Message
```bash
POST /api/message
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "systemPrompt": "You are a helpful assistant"
}
```

Response:
```json
{
  "success": true,
  "message": "Hello, how are you?",
  "response": "I'm doing well, thank you for asking!",
  "provider": "openai",
  "timestamp": "2024-05-06T10:30:00Z"
}
```

### 3. Multi-turn Chat
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "What is machine learning?"},
    {"role": "assistant", "content": "Machine learning is..."},
    {"role": "user", "content": "Tell me more about neural networks"}
  ],
  "systemPrompt": "You are an AI expert"
}
```

Response:
```json
{
  "success": true,
  "response": "Neural networks are...",
  "provider": "openai",
  "timestamp": "2024-05-06T10:30:00Z"
}
```

### 4. Bot Information
```bash
GET /api/bot/info
```

Response:
```json
{
  "name": "Telegram LLM Bot",
  "version": "1.0.0",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "endpoints": {
    "health": "/health",
    "chat": "/api/chat",
    "message": "/api/message",
    "botInfo": "/api/bot/info"
  }
}
```

## Telegram Bot Commands

Once the bot is running, use these commands on Telegram:

- `/start` - Start the bot and see welcome message
- `/help` - Show available commands
- `/clear` - Clear conversation history
- `/status` - Check bot status
- `/model` - Show current LLM model

Just send any message to chat with the AI!

## Project Structure

```
telegram/
├── server.js          # Express server and API endpoints
├── bot.js             # Telegram bot handler
├── llmClient.js       # LLM integration client
├── package.json       # Dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## How It Works

1. **User sends message on Telegram** → Bot receives it
2. **Message is processed** → Added to conversation context
3. **LLM is called** → With full conversation history
4. **Response is generated** → By the LLM provider
5. **Response sent back to user** → On Telegram

## Configuration

### Changing LLM Provider

Edit `.env`:
```env
LLM_PROVIDER=cohere  # Change to cohere, local, etc.
COHERE_API_KEY=your_key
```

### Adjusting Model Parameters

Edit `llmClient.js` in the `openaiChat()` function:
```javascript
temperature: 0.7,  // 0-1: Lower = more focused, Higher = more creative
max_tokens: 1000   // Maximum response length
```

## Deployment

### Using PM2 (Production)

```bash
npm install -g pm2
pm2 start server.js --name "telegram-llm-bot"
pm2 save
```

### Using Docker (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t telegram-llm-bot .
docker run -p 3000:3000 --env-file .env telegram-llm-bot
```

## Troubleshooting

### Bot not responding
- Check if `TELEGRAM_BOT_TOKEN` is correct
- Verify internet connection
- Check logs for errors

### LLM errors
- Verify API key is correct
- Check rate limits (OpenAI has usage limits)
- Ensure LLM provider is properly configured

### Message too long
- Bot automatically splits responses > 4096 characters
- Some providers may have token limits

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| TELEGRAM_BOT_TOKEN | Yes | Telegram bot token from @BotFather |
| LLM_PROVIDER | No | LLM provider (openai, cohere, local) |
| OPENAI_API_KEY | If provider=openai | OpenAI API key |
| OPENAI_MODEL | No | OpenAI model name |
| COHERE_API_KEY | If provider=cohere | Cohere API key |
| LOCAL_LLM_URL | If provider=local | Local LLM endpoint |
| LOCAL_MODEL | If provider=local | Local LLM model name |
| PORT | No | Server port (default: 3000) |
| NODE_ENV | No | Environment (development/production) |

## Security Best Practices

⚠️ **Important:**
1. Never commit `.env` file to git
2. Use strong API keys
3. Implement rate limiting in production
4. Validate user input before sending to LLM
5. Use HTTPS for webhook endpoints
6. Implement authentication for API endpoints

## License

MIT

## Support

For issues and questions, please check:
- Telegram Bot API docs: https://core.telegram.org/bots
- Telegraf docs: https://telegraf.js.org/
- OpenAI docs: https://platform.openai.com/docs

## Contributing

Contributions are welcome! Please feel free to submit improvements.
