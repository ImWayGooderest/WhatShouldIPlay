import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Header() {
  const currentUser = useStore((state) => state.currentUser);

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">🎮 WhatShouldIPlay</div>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className="hover:text-primary-200 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/search"
              className="hover:text-primary-200 transition-colors font-medium"
            >
              Browse Games
            </Link>
            <Link
              to="/library"
              className="hover:text-primary-200 transition-colors font-medium"
            >
              My Library
            </Link>
          </nav>

          {currentUser && (
            <div className="flex items-center space-x-3">
              {currentUser.avatarMedium && (
                <img
                  src={currentUser.avatarMedium}
                  alt={currentUser.username || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              )}
              <span className="hidden md:block font-medium">
                {currentUser.username || currentUser.realname}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
