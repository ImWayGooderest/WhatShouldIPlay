import request from 'supertest';
import { createApp } from '../../app';
import { Game } from '../../models/Game';

jest.mock('../../models/Game');

describe('Game Controller', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/games/random', () => {
    it('should return a random game', async () => {
      const mockGame = {
        gbId: 1,
        name: 'Test Game',
        deck: 'A test game',
        toJSON: () => ({ gbId: 1, name: 'Test Game', deck: 'A test game' }),
      };

      (Game.countDocuments as jest.Mock).mockResolvedValue(100);
      (Game.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockGame]),
      });

      const response = await request(app).get('/api/games/random');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.game).toBeTruthy();
    });

    it('should return 404 when no games exist', async () => {
      (Game.countDocuments as jest.Mock).mockResolvedValue(0);

      const response = await request(app).get('/api/games/random');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('No games found');
    });
  });

  describe('GET /api/games/:id', () => {
    it('should return game by ID', async () => {
      const mockGame = {
        gbId: 1,
        name: 'Test Game',
        deck: 'A test game',
      };

      (Game.findOne as jest.Mock).mockResolvedValue(mockGame);

      const response = await request(app).get('/api/games/1');

      expect(response.status).toBe(200);
      expect(response.body.data.game.gbId).toBe(1);
    });

    it('should return 404 for non-existent game', async () => {
      (Game.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/games/999999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/games/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/games/search', () => {
    it('should search games by genre', async () => {
      const mockGames = [
        { gbId: 1, name: 'Game 1' },
        { gbId: 2, name: 'Game 2' },
      ];

      (Game.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockGames),
      });

      const response = await request(app)
        .get('/api/games/search')
        .query({ type: 'genre', value: 'Action' });

      expect(response.status).toBe(200);
      expect(response.body.data.games).toHaveLength(2);
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app).get('/api/games/search');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid filter type', async () => {
      const response = await request(app)
        .get('/api/games/search')
        .query({ type: 'invalid', value: 'test' });

      expect(response.status).toBe(400);
    });
  });
});
