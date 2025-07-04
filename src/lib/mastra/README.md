# Mastra AI Movie Agent

This implementation uses [Mastra AI](https://context7.com/mastra-ai/mastra/llms.txt) to create a sophisticated movie recommendation system with structured tools and intelligent agent capabilities.

## Architecture

### 🛠️ **Tools** (`src/lib/mastra/tools.ts`)

Four specialized tools that interact with The Movie Database (TMDB) API:

1. **`searchMoviesTool`** - Search for movies by title, actor, director
2. **`discoverMoviesTool`** - Discover movies by genre, year, rating
3. **`trendingMoviesTool`** - Get currently trending movies
4. **`movieGenresTool`** - List all available movie genres

### 🤖 **Agent** (`src/lib/mastra/agent.ts`)

A Mastra AI agent powered by GPT-4o-mini that:

- Uses all movie tools intelligently
- Provides formatted, engaging responses
- Asks follow-up questions to refine recommendations
- Formats results with markdown and emojis

### 🔧 **Integration** (`src/lib/mastra/index.ts`)

Main Mastra configuration that exports the agent and tools for use in the application.

## API Endpoints

### Chat API (`/api/chat`)

- **POST**: Send a message to the movie agent
- **GET**: Retrieve conversation history

### Test API (`/api/test-mastra`)

Test individual components:

- `?test=agent` - Test full agent interaction
- `?test=search` - Test search tool directly
- `?test=trending` - Test trending tool directly
- `?test=genres` - Test genres tool directly

## Usage Examples

### Basic Chat

```javascript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Show me trending movies" }),
});
```

### Tool Testing

```javascript
// Test the agent
const agentTest = await fetch("/api/test-mastra?test=agent");

// Test search tool
const searchTest = await fetch("/api/test-mastra?test=search");
```

## Features

✅ **Structured Tools**: Each tool has defined input/output schemas  
✅ **Intelligent Agent**: Uses GPT-4o-mini for natural language understanding  
✅ **TMDB Integration**: Full access to movie database  
✅ **Conversation Memory**: Persistent chat history  
✅ **Error Handling**: Graceful fallbacks and error messages  
✅ **Type Safety**: Full TypeScript support

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token
DATABASE_URL=your_postgresql_url
```

## Dependencies

- `@mastra/core` - Mastra AI framework
- `@ai-sdk/openai` - OpenAI SDK integration
- `zod` - Schema validation
- `@prisma/client` - Database ORM
