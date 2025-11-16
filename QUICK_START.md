# Quick Start Guide

Get WhatShouldIPlay up and running in 5 minutes!

## Prerequisites

- Node.js 20+ and npm 10+
- Docker & Docker Compose (recommended) OR MongoDB 7+
- Steam API Key: https://steamcommunity.com/dev/apikey
- GiantBomb API Key: https://www.giantbomb.com/api/

## Option 1: Docker (Recommended) ⚡

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/WhatShouldIPlay.git
cd WhatShouldIPlay

# 2. Create environment file
cp backend/.env.example backend/.env

# 3. Edit .env and add your API keys
nano backend/.env
# Add your STEAM_API_KEY and GIANTBOMB_API_KEY

# 4. Start everything with Docker
docker-compose up -d

# 5. Open your browser
# Frontend: http://localhost
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

That's it! 🎉

## Option 2: Manual Setup

### Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start development server
npm run dev
```

Backend will run on http://localhost:3000

### Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

### MongoDB

Make sure MongoDB is running on `localhost:27017`, or update `MONGODB_URI` in backend/.env

## Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 2 sample games
- 1 sample Steam user
- Game mappings

## Useful Commands

```bash
# View Docker logs
docker-compose logs -f

# Stop Docker containers
docker-compose down

# Restart containers
docker-compose restart

# Backend tests
cd backend && npm test

# Format code
cd backend && npm run format
cd frontend && npm run format
```

## Using Makefile (Linux/Mac)

```bash
make install      # Install all dependencies
make dev          # Start both servers
make docker-up    # Start Docker
make docker-down  # Stop Docker
make test         # Run tests
make help         # Show all commands
```

## Troubleshooting

### Port already in use

```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 5173
lsof -i :5173
```

### MongoDB connection issues

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Or if running locally
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Clear everything and restart

```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: deletes database)
docker-compose down -v

# Rebuild and start fresh
docker-compose build --no-cache
docker-compose up -d
```

## Next Steps

1. **Read the full README**: [README.md](./README.md)
2. **Check API docs**: http://localhost:3000/api/docs
3. **Explore the code**: See project structure in README
4. **Run tests**: `cd backend && npm test`
5. **Contribute**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Environment Variables

### Required
- `STEAM_API_KEY` - Your Steam API key
- `GIANTBOMB_API_KEY` - Your GiantBomb API key
- `SESSION_SECRET` - Random string for sessions (auto-generated is fine)

### Optional
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis URL for caching
- `PORT` - Backend port (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) if upgrading from v1.0
- Open an issue on GitHub

Happy gaming! 🎮
