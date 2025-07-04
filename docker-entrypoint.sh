#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "✅ Database is ready!"

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🎬 Starting the movie chat application..."

# Start the application
exec node server.js 