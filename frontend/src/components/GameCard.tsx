import { Link } from 'react-router-dom';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link to={`/game/${game.gbId}`} className="game-card block">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {game.image?.medium_url ? (
          <img
            src={game.image.medium_url}
            alt={game.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-gray-600 text-4xl">🎮</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{game.name}</h3>

        {game.deck && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{game.deck}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {game.genres?.slice(0, 3).map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
            >
              {genre.name}
            </span>
          ))}
        </div>

        {game.developers && game.developers.length > 0 && (
          <div className="mt-3 text-sm text-gray-500">
            by {game.developers[0].name}
          </div>
        )}
      </div>
    </Link>
  );
}
