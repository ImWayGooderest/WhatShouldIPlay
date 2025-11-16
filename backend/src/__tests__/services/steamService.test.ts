import { steamService } from '../../services/steamService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SteamService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('lookupUser', () => {
    it('should lookup user by Steam ID64', async () => {
      const mockProfile = {
        steamID64: '76561198012345678',
        steamID: 'testuser',
        onlineState: 'online',
        stateMessage: 'Online',
        privacyState: 'public',
        visibilityState: '3',
        avatarIcon: 'https://example.com/avatar.jpg',
        avatarMedium: 'https://example.com/avatar_medium.jpg',
        avatarFull: 'https://example.com/avatar_full.jpg',
        vacBanned: '0',
        tradeBanState: 'None',
        isLimitedAccount: '0',
      };

      const mockXmlResponse = `
        <?xml version="1.0" encoding="UTF-8"?>
        <profile>
          <steamID64>76561198012345678</steamID64>
          <steamID>testuser</steamID>
          <onlineState>online</onlineState>
          <stateMessage>Online</stateMessage>
          <privacyState>public</privacyState>
          <visibilityState>3</visibilityState>
          <avatarIcon>https://example.com/avatar.jpg</avatarIcon>
          <avatarMedium>https://example.com/avatar_medium.jpg</avatarMedium>
          <avatarFull>https://example.com/avatar_full.jpg</avatarFull>
          <vacBanned>0</vacBanned>
          <tradeBanState>None</tradeBanState>
          <isLimitedAccount>0</isLimitedAccount>
        </profile>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockXmlResponse });

      const result = await steamService.lookupUser('76561198012345678');

      expect(result.steamID64).toBe('76561198012345678');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('steamcommunity.com/profiles/76561198012345678'),
        expect.any(Object)
      );
    });

    it('should handle user not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      });

      await expect(steamService.lookupUser('invaliduser')).rejects.toThrow();
    });
  });

  describe('getOwnedGames', () => {
    it('should fetch owned games for a Steam user', async () => {
      const mockGames = [
        { appid: 730, name: 'Counter-Strike: Global Offensive', playtime_forever: 1000 },
        { appid: 440, name: 'Team Fortress 2', playtime_forever: 500 },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          response: {
            games: mockGames,
          },
        },
      });

      const result = await steamService.getOwnedGames('76561198012345678');

      expect(result).toHaveLength(2);
      expect(result[0].appid).toBe(730);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('IPlayerService/GetOwnedGames'),
        expect.objectContaining({
          params: expect.objectContaining({
            steamid: '76561198012345678',
          }),
        })
      );
    });

    it('should return empty array when user has no games', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          response: {},
        },
      });

      const result = await steamService.getOwnedGames('76561198012345678');

      expect(result).toEqual([]);
    });
  });
});
