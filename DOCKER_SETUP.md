# 🐋 Docker Setup Guide

This guide will help you run the entire project with just one command: `docker compose up`

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
- An OpenAI API key for the AI chat functionality

## 🔑 Required Environment Variables

Before running the application, you need to set up your environment variables:

### 1. Create a `.env` file in the project root:

```bash
touch .env
```

### 2. Add the following environment variables to your `.env` file:

```env
# REQUIRED: OpenAI API Key for AI functionality
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# OPTIONAL: TMDB Access Token (has a fallback token in the code)
# Get your access token from: https://www.themoviedb.org/settings/api
TMDB_ACCESS_TOKEN=your_tmdb_access_token_here
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

## 🚀 Quick Start

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <your-repo-url>
   cd test-pers
   ```

2. **Set up environment variables** (see section above)

3. **Run the application**:
   ```bash
   docker compose up
   ```

That's it! 🎉 The application will be available at http://localhost:3000

## 📊 What's Running

The Docker Compose setup includes:

- **PostgreSQL Database** (port 5432)

  - Database: `testpers`
  - Username: `postgres`
  - Password: `postgres`

- **Next.js Application** (port 3000)
  - Automatically runs database migrations
  - Includes AI chat functionality with OpenAI
  - Movie recommendations via TMDB API

## 🔧 Available Commands

- **Start the application**:

  ```bash
  docker compose up
  ```

- **Start in background**:

  ```bash
  docker compose up -d
  ```

- **Stop the application**:

  ```bash
  docker compose down
  ```

- **Rebuild and start** (after code changes):

  ```bash
  docker compose up --build
  ```

- **View logs**:
  ```bash
  docker compose logs
  docker compose logs app    # App logs only
  docker compose logs db     # Database logs only
  ```

## 🗄️ Database Access

If you need to access the PostgreSQL database directly:

```bash
# Connect to the database container
docker compose exec db psql -U postgres -d testpers

# Or from your host machine (if you have psql installed)
psql -h localhost -p 5432 -U postgres -d testpers
```

## 🔄 Database Management

The application automatically:

- Waits for the database to be ready
- Runs Prisma migrations on startup
- Creates the necessary tables

If you need to reset the database:

```bash
docker compose down -v  # This removes the database volume
docker compose up       # This recreates everything fresh
```

## 🛠️ Troubleshooting

### Application won't start

1. Check if the required environment variables are set
2. Ensure Docker is running
3. Check logs with `docker compose logs`

### Database connection issues

1. Wait a few moments for the database to fully initialize
2. Check database health: `docker compose exec db pg_isready -U postgres`

### OpenAI API errors

1. Verify your `OPENAI_API_KEY` is correct and has credits
2. Check the API key has the necessary permissions

### Port conflicts

If ports 3000 or 5432 are already in use, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000" # Use port 3001 instead of 3000
```

## 🎯 Production Considerations

For production deployment:

1. Use environment-specific `.env` files
2. Set up proper database backups
3. Configure reverse proxy (nginx/Traefik)
4. Use Docker secrets for sensitive data
5. Monitor container health and logs

## 📝 Notes

- The application uses PostgreSQL as the database
- Database data persists in a Docker volume
- The TMDB API has a fallback token, but you can provide your own for higher rate limits
- All dependencies are handled within the containers - no need to install Node.js or npm locally
