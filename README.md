# 🎮 WhatShouldIPlay v2.0

A modern, full-stack web application that helps Steam users discover what game to play from their library using intelligent game recommendations powered by the Steam and GiantBomb APIs.

## 🚀 Complete Modernization (v2.0)

This is a **complete rewrite** of the original 2015-2016 college senior project, rebuilt from the ground up with modern technologies and best practices.

### What's New in v2.0

- ✅ **TypeScript** throughout frontend and backend
- ✅ **Modern React 18** with hooks and functional components
- ✅ **Vite** for lightning-fast builds (10-100x faster than Webpack)
- ✅ **Tailwind CSS** for modern, responsive design
- ✅ **Latest Node.js & Express** with async/await patterns
- ✅ **MongoDB 7.x** with Mongoose schemas and validation
- ✅ **Comprehensive security** (Helmet, CORS, rate limiting, input validation)
- ✅ **Docker & Docker Compose** for easy deployment
- ✅ **CI/CD pipeline** with GitHub Actions
- ✅ **ESLint & Prettier** for code quality
- ✅ **Proper error handling** and logging with Winston
- ✅ **API documentation** ready
- ✅ **Zero security vulnerabilities**

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Users
- 🔍 **Steam Library Integration** - Connect your Steam account to see your games
- 🎲 **Random Game Picker** - Can't decide? Get a random recommendation
- 📊 **Rich Game Metadata** - Genres, themes, concepts, developers from GiantBomb
- 🔎 **Advanced Search** - Filter games by genre, theme, concept, or developer
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Fast & Modern** - Built with the latest web technologies

### For Developers
- 🏗️ **Clean Architecture** - Separation of concerns (routes, controllers, services, models)
- 🔒 **Security First** - Input validation, rate limiting, secure headers
- 🧪 **Testing Ready** - Jest configured for backend, React Testing Library for frontend
- 📦 **Docker Support** - One command to run the entire stack
- 🔄 **CI/CD Pipeline** - Automated testing and deployment
- 📚 **Comprehensive Documentation** - API docs, code comments, and guides

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client

### Backend
- **Node.js 20+** - Runtime
- **Express 4** - Web framework
- **TypeScript** - Type safety
- **MongoDB 7** - Database
- **Mongoose 8** - ODM
- **Winston** - Logging
- **Zod** - Schema validation
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint & Prettier** - Code quality
- **Jest** - Testing
- **Nginx** - Frontend serving

### External APIs
- **Steam Web API** - User data & game library
- **GiantBomb API** - Game metadata & information

## 📦 Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **MongoDB** 7.x (or use Docker)
- **Docker** & **Docker Compose** (optional, recommended)

### API Keys Required

1. **Steam API Key** - Get from https://steamcommunity.com/dev/apikey
2. **GiantBomb API Key** - Get from https://www.giantbomb.com/api/

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/WhatShouldIPlay.git
cd WhatShouldIPlay

# Create environment file
cp backend/.env.example backend/.env

# Edit backend/.env and add your API keys
nano backend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Visit http://localhost for the frontend and http://localhost:3000 for the API.

### Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API keys
nano .env

# Start development server
npm run dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 💻 Development

### Project Structure

```
WhatShouldIPlay/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Docker orchestration
├── .github/               # GitHub Actions workflows
└── README.md              # This file
```

### Available Scripts

#### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

### Environment Variables

#### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/wsip

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Security
SESSION_SECRET=your-secret-key-here

# API Keys
STEAM_API_KEY=your-steam-api-key
GIANTBOMB_API_KEY=your-giantbomb-api-key

# Rate Limiting
GIANTBOMB_DELAY_MS=15000

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Traditional Deployment

#### Backend

```bash
cd backend
npm ci --production
npm run build
NODE_ENV=production node dist/server.js
```

#### Frontend

```bash
cd frontend
npm ci
npm run build
# Serve dist/ directory with nginx or similar
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Games

```
GET  /api/games/random              # Get random game
GET  /api/games/:id                 # Get game by ID
GET  /api/games/search              # Search games
GET  /api/games/filters/:type       # Get filter values
POST /api/games/match               # Match Steam to GiantBomb
```

#### Steam

```
POST /api/steam/lookup              # Lookup Steam user
GET  /api/steam/:steamId64/games    # Get user's games
GET  /api/steam/:steamId64/random   # Random user game
```

#### Health Check

```
GET  /api/health                    # API health status
```

### Example Requests

#### Lookup Steam User

```bash
curl -X POST http://localhost:3000/api/steam/lookup \
  -H "Content-Type: application/json" \
  -d '{"identifier": "your_steam_username"}'
```

#### Search Games by Genre

```bash
curl "http://localhost:3000/api/games/search?type=genre&value=Action&limit=10"
```

## 🏗️ Architecture

### Backend Architecture

```
Request → Routes → Controllers → Services → Models → Database
                        ↓
                   Middleware (validation, error handling, rate limiting)
```

### Key Design Patterns

- **MVC Pattern** - Separation of concerns
- **Service Layer** - Business logic isolation
- **Repository Pattern** - Data access abstraction
- **Singleton Pattern** - Service instances
- **Factory Pattern** - Model creation
- **Middleware Pattern** - Request/response processing

### Security Measures

- ✅ Input validation with Zod
- ✅ Rate limiting on API endpoints
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ No SQL injection (Mongoose)
- ✅ XSS protection
- ✅ Environment variable validation
- ✅ Error message sanitization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality

- Run `npm run lint` before committing
- Run `npm run format` to format code
- Ensure all tests pass with `npm test`
- Follow existing code style and conventions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Original Team (v1.0 - 2015-2016)

Original college senior project (CPSC 473):
- [Original team members from readme.md]

## 🎉 Acknowledgments

- **Steam** for the Web API
- **GiantBomb** for comprehensive game data
- Original project team for the foundation
- Open source community for amazing tools

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review API documentation

---

**Built with ❤️ using modern web technologies**

From a 2015 college project to a modern full-stack application!
