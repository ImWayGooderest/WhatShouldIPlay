import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { steamApi } from '../services/api';
import { useStore } from '../store/useStore';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function UserLibraryPage() {
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [steamInput, setSteamInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: libraryData,
    isLoading: libraryLoading,
    error: libraryError,
  } = useQuery({
    queryKey: ['userGames', currentUser?.steamID64],
    queryFn: () => steamApi.getUserGames(currentUser!.steamID64),
    enabled: !!currentUser,
  });

  const {
    data: randomGame,
    refetch: getRandomGame,
  } = useQuery({
    queryKey: ['randomUserGame', currentUser?.steamID64],
    queryFn: () => steamApi.getRandomUserGame(currentUser!.steamID64),
    enabled: false,
  });

  const handleSteamLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamInput.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const user = await steamApi.lookupUser(steamInput.trim());
      setCurrentUser(user);
      setSteamInput('');
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Failed to find Steam user');
    } finally {
      setIsLookingUp(false);
    }
  };

  const filteredGames = libraryData?.games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Find Your Steam Library</h2>
            <p className="text-gray-600 mb-6">
              Enter your Steam username or ID64 to view your game library
            </p>

            <form onSubmit={handleSteamLookup} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={steamInput}
                  onChange={(e) => setSteamInput(e.target.value)}
                  placeholder="Enter Steam username or ID64..."
                  className="input-field"
                  disabled={isLookingUp}
                />
              </div>

              {lookupError && <ErrorMessage message={lookupError} />}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isLookingUp || !steamInput.trim()}
              >
                {isLookingUp ? 'Looking up...' : 'Find My Games'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info */}
      <div className="card mb-8">
        <div className="flex items-center space-x-4">
          {currentUser.avatarFull && (
            <img
              src={currentUser.avatarFull}
              alt={currentUser.username || 'User'}
              className="w-20 h-20 rounded-full"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {currentUser.realname || currentUser.username}'s Library
            </h1>
            <p className="text-gray-600">
              {currentUser.gameCount} games
            </p>
          </div>
          <button
            onClick={() => getRandomGame()}
            className="btn-primary"
          >
            🎲 Random Game
          </button>
        </div>
      </div>

      {/* Random Game Result */}
      {randomGame && (
        <div className="card mb-8 bg-primary-50 border-2 border-primary-200">
          <h2 className="text-xl font-semibold mb-4">🎲 You should play:</h2>
          <div className="flex items-center space-x-4">
            {randomGame.img_icon_url && (
              <img
                src={`https://media.steampowered.com/steamcommunity/public/images/apps/${randomGame.appid}/${randomGame.img_icon_url}.jpg`}
                alt={randomGame.name}
                className="w-16 h-16"
              />
            )}
            <div>
              <h3 className="text-2xl font-bold">{randomGame.name}</h3>
              <p className="text-gray-600">
                {Math.floor(randomGame.playtime_forever / 60)} hours played
              </p>
            </div>
          </div>
        </div>
      )}

      {libraryLoading && <Loading />}

      {libraryError && (
        <ErrorMessage
          message={
            libraryError instanceof Error ? libraryError.message : 'Failed to load library'
          }
        />
      )}

      {libraryData && (
        <>
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your games..."
              className="input-field max-w-md"
            />
          </div>

          {/* Games List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Playtime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGames?.map((game) => (
                    <tr key={game.appid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {game.img_icon_url && (
                            <img
                              src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                              alt={game.name}
                              className="w-10 h-10 mr-3"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {game.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.floor(game.playtime_forever / 60)}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {game.gbData ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Enriched
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Basic
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredGames?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No games found matching "{searchTerm}"
            </div>
          )}
        </>
      )}
    </div>
  );
}
