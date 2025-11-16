import { giantBombService } from '../../services/giantBombService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GiantBombService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchGame', () => {
    it('should search for games by name', async () => {
      const mockGames = [
        {
          id: 1,
          name: 'Half-Life 2',
          deck: 'A great FPS game',
          image: { medium_url: 'https://example.com/image.jpg' },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status_code: 1,
          results: mockGames,
        },
      });

      const result = await giantBombService.searchGame('Half-Life 2');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Half-Life 2');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('giantbomb.com/api/search'),
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'Half-Life 2',
            resources: 'game',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status_code: 100, // Error code
          error: 'Invalid API key',
        },
      });

      await expect(giantBombService.searchGame('test')).rejects.toThrow();
    });
  });

  describe('findBestMatch', () => {
    it('should find exact match', () => {
      const mockGames = [
        { id: 1, name: 'Half-Life 2' },
        { id: 2, name: 'Half-Life 2: Episode One' },
      ];

      const result = giantBombService.findBestMatch('Half-Life 2', mockGames as any);

      expect(result?.id).toBe(1);
    });

    it('should find partial match', () => {
      const mockGames = [
        { id: 1, name: 'The Elder Scrolls V: Skyrim' },
        { id: 2, name: 'Skyrim Special Edition' },
      ];

      const result = giantBombService.findBestMatch('Skyrim', mockGames as any);

      expect(result).toBeTruthy();
    });

    it('should return null for empty results', () => {
      const result = giantBombService.findBestMatch('test', []);

      expect(result).toBeNull();
    });
  });
});
