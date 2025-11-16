import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../services/api';
import { FilterType } from '../types';
import GameCard from '../components/GameCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function SearchPage() {
  const [filterType, setFilterType] = useState<'genres' | 'themes' | 'concepts' | 'developers'>('genres');
  const [selectedValue, setSelectedValue] = useState<string>('');

  const { data: filterValues, isLoading: valuesLoading } = useQuery({
    queryKey: ['filterValues', filterType],
    queryFn: () => gameApi.getFilterValues(filterType),
  });

  const {
    data: games,
    isLoading: gamesLoading,
    error: gamesError,
  } = useQuery({
    queryKey: ['searchGames', filterType, selectedValue],
    queryFn: () => {
      const type = filterType.slice(0, -1) as FilterType;
      return gameApi.searchGames(type, selectedValue);
    },
    enabled: !!selectedValue,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Games</h1>

      {/* Filter Controls */}
      <div className="card mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter By
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setSelectedValue('');
              }}
              className="input-field"
            >
              <option value="genres">Genre</option>
              <option value="themes">Theme</option>
              <option value="concepts">Concept</option>
              <option value="developers">Developer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {filterType.slice(0, -1)}
            </label>
            {valuesLoading ? (
              <div className="input-field">Loading...</div>
            ) : (
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="input-field"
              >
                <option value="">-- Select --</option>
                {filterValues?.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {!selectedValue && (
        <div className="text-center py-12 text-gray-500">
          Select a filter to browse games
        </div>
      )}

      {gamesLoading && <Loading />}

      {gamesError && (
        <ErrorMessage
          message={gamesError instanceof Error ? gamesError.message : 'Failed to load games'}
        />
      )}

      {games && games.length === 0 && (
        <div className="text-center py-12 text-gray-500">No games found</div>
      )}

      {games && games.length > 0 && (
        <div>
          <div className="mb-4 text-gray-600">
            Found {games.length} games
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.gbId} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
