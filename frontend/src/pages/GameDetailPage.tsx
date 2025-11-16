import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', id],
    queryFn: () => gameApi.getGameById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Game not found'}
        />
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-primary-600 hover:text-primary-700 font-medium">
        ← Back
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{game.name}</h1>

          {game.image?.super_url && (
            <img
              src={game.image.super_url}
              alt={game.name}
              className="w-full rounded-lg shadow-lg mb-6"
            />
          )}

          {game.deck && (
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{game.deck}</p>
            </div>
          )}

          {game.site_detail_url && (
            <a
              href={game.site_detail_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              View on GiantBomb →
            </a>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Developers */}
          {game.developers && game.developers.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-3">Developers</h3>
              <ul className="space-y-2">
                {game.developers.map((dev) => (
                  <li key={dev.id} className="text-gray-700">
                    {dev.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {game.themes && game.themes.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-3">Themes</h3>
              <div className="flex flex-wrap gap-2">
                {game.themes.map((theme) => (
                  <span
                    key={theme.id}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {theme.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Concepts */}
          {game.concepts && game.concepts.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-3">Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {game.concepts.slice(0, 10).map((concept) => (
                  <span
                    key={concept.id}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {concept.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-3">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((platform) => (
                  <span
                    key={platform.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {platform.abbreviation || platform.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Release Date */}
          {game.original_release_date && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-2">Release Date</h3>
              <p className="text-gray-700">
                {new Date(game.original_release_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
