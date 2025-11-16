# Contributing to WhatShouldIPlay

Thank you for considering contributing to WhatShouldIPlay! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and considerate of others.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue describing:
   - Use case and motivation
   - Proposed solution
   - Alternative solutions considered

### Pull Requests

1. Fork the repository
2. Create a new branch from `develop`
3. Make your changes
4. Ensure tests pass
5. Run linters and formatters
6. Commit with clear messages
7. Push and create a PR

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/WhatShouldIPlay.git
cd WhatShouldIPlay

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Create .env files
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start development
cd backend && npm run dev
cd frontend && npm run dev
```

## Code Style

- Use TypeScript
- Follow existing patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Linting & Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add user authentication
fix: resolve memory leak in game service
docs: update API documentation
style: format code with prettier
refactor: simplify Steam API service
test: add tests for game controller
chore: update dependencies
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Tests

## Pull Request Process

1. Update README.md if needed
2. Update documentation
3. Ensure CI/CD passes
4. Request review from maintainers
5. Address feedback
6. Squash commits if requested

## Questions?

Open an issue or reach out to maintainers.

Thank you for contributing! 🎉
