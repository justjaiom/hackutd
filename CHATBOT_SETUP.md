# AI ChatBot Setup Guide

## Overview
The AI ChatBot uses Google's Gemini API to provide intelligent assistance for your projects. It can answer questions about tasks, uploaded files, project status, and help you understand what needs to be done.

## Features
- 🤖 Real-time AI responses using Gemini 1.5 Flash
- 📊 Context-aware: understands your tasks, files, and project structure
- 💬 Streaming responses for better UX
- 🎯 Helps prioritize work and answer project questions
- 📱 Responsive design with floating chat button

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add Environment Variable

Create or update your `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

**Important:** Never commit this file to git. It's already in `.gitignore`.

### 3. Install Dependencies

```bash
npm install @google/generative-ai
```

### 4. Restart Development Server

```bash
npm run dev
```

## Usage

### User Interface
- A floating **"AI Assistant"** button appears in the bottom-right corner of project pages
- Click to open the chat panel
- Type your question and press Enter or click Send
- Responses stream in real-time

### Example Questions
- "What tasks are in progress?"
- "What needs to be done next?"
- "Summarize the project status"
- "What files have been uploaded?"
- "Which tasks are high priority?"
- "What's the status of [task name]?"

## How It Works

### 1. Context Building (`lib/gemini.ts`)
- Fetches project details (name, description)
- Gathers all tasks with status, priority, assignee
- Lists uploaded files from Knowledge Hub and Meetings sections
- Builds comprehensive context prompt

### 2. Chat API (`app/api/projects/[projectId]/chat/route.ts`)
- Authenticates user
- Fetches fresh project data
- Sends message + context to Gemini
- Streams response back to client

### 3. ChatBot Component (`components/ChatBot.tsx`)
- Floating button UI
- Chat panel with message history
- Real-time streaming display
- Maintains conversation context (last 10 messages)

## Architecture

```
┌─────────────────┐
│   ChatBot.tsx   │ (UI Component)
└────────┬────────┘
         │
         ↓ POST /api/projects/[projectId]/chat
┌─────────────────┐
│  chat/route.ts  │ (API Handler)
└────────┬────────┘
         │
         ├─→ Fetch Tasks from Supabase
         ├─→ Fetch Files from Supabase
         ├─→ Fetch Project Details
         │
         ↓
┌─────────────────┐
│   gemini.ts     │ (AI Integration)
└────────┬────────┘
         │
         ↓ Gemini API (streaming)
┌─────────────────┐
│  Google Gemini  │
└─────────────────┘
```

## Customization

### Adjust AI Behavior
Edit `lib/gemini.ts` to modify:
- System prompt (how AI responds)
- Temperature (creativity level, currently 0.7)
- Max tokens (response length, currently 1000)
- Model version (currently gemini-1.5-flash)

### Change UI Style
Edit `components/ChatBot.tsx` to modify:
- Colors and gradients
- Chat panel size
- Button position
- Message styling

### Add More Context
Modify `app/api/projects/[projectId]/chat/route.ts` to include:
- Company information
- Project milestones
- Team member data
- Custom metadata

## Troubleshooting

### "Failed to generate response from AI"
- Check if `GEMINI_API_KEY` is set correctly
- Verify API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check server logs for detailed error messages

### No Response or Slow
- Gemini API might be rate-limited
- Check your internet connection
- Consider upgrading to a paid Gemini plan for higher limits

### Context Not Accurate
- Ensure tasks and files are properly saved to Supabase
- Check RLS policies allow reading project data
- Verify user authentication

## API Limits

**Free Tier (Gemini 1.5 Flash):**
- 15 requests per minute
- 1 million tokens per day
- 1500 requests per day

For production use, consider [upgrading to Gemini API paid tier](https://ai.google.dev/pricing).

## Security Notes

- API key is server-side only (never exposed to client)
- User authentication required for all chat requests
- RLS policies enforce data access control
- Conversation history limited to prevent context overflow

## Next Steps

Consider adding:
- **Conversation persistence** - Save chat history to database
- **Voice input** - Use Web Speech API for voice commands
- **Suggestions** - Show suggested questions based on project state
- **Actions** - Allow AI to create/update tasks via function calling
- **Analytics** - Track common questions to improve UX
