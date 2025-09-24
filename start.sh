#!/bin/bash

# HR Onboarding MVP Startup Script
echo "🚀 Starting HR Onboarding MVP..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual credentials before proceeding."
    echo "   You can use demo values for testing."
    read -p "Press Enter to continue with demo values, or Ctrl+C to edit .env first..."
fi

# Create logs directory
mkdir -p logs

echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."

# Check backend health
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend API is running at http://localhost:3001"
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

# Check database
if docker-compose exec -T postgres pg_isready -U user -d mvp_logs > /dev/null 2>&1; then
    echo "✅ PostgreSQL database is running"
else
    echo "❌ PostgreSQL database is not responding"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not responding"
fi

echo ""
echo "🎉 HR Onboarding MVP is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 Health Check: http://localhost:3001/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
echo "📖 For more information, see README.md"
