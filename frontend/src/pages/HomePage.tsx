import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gameApi, steamApi } from '../services/api';
import { useStore } from '../store/useStore';
import GameCard from '../components/GameCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function HomePage() {
  const navigate = useNavigate();
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [steamInput, setSteamInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const {
    data: randomGame,
    isLoading: gameLoading,
    error: gameError,
    refetch: fetchNewGame,
  } = useQuery({
    queryKey: ['randomGame'],
    queryFn: gameApi.getRandomGame,
  });

  const handleSteamLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamInput.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const user = await steamApi.lookupUser(steamInput.trim());
      setCurrentUser(user);
      navigate('/library');
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Failed to find Steam user');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          What Should I Play?
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover amazing games from your Steam library or browse our entire database
        </p>
      </div>

      {/* Steam Lookup Section */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Find Your Steam Library</h2>
          <p className="text-gray-600 mb-6">
            Enter your Steam username or ID64 to see personalized game recommendations
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

      {/* Random Game Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Not Sure What to Play?</h2>
          <p className="text-gray-600 mb-6">
            Let us pick a random game from our database for you!
          </p>
          <button
            onClick={() => fetchNewGame()}
            className="btn-primary"
            disabled={gameLoading}
          >
            🎲 Get Random Game
          </button>
        </div>

        {gameLoading && <Loading />}

        {gameError && (
          <ErrorMessage
            message={gameError instanceof Error ? gameError.message : 'Failed to load game'}
          />
        )}

        {randomGame && !gameLoading && (
          <div className="max-w-md mx-auto">
            <GameCard game={randomGame} />
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Browse Games</h3>
          <p className="text-gray-600 mb-4">
            Search by genre, theme, concept, or developer
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-secondary"
          >
            Start Browsing
          </button>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Your Library</h3>
          <p className="text-gray-600 mb-4">
            View your Steam games with rich metadata
          </p>
          <button
            onClick={() => navigate('/library')}
            className="btn-secondary"
          >
            View Library
          </button>
        </div>
      </div>
    </div>
  );
}
