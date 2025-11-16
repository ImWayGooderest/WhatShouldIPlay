import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import UserLibraryPage from './pages/UserLibraryPage';
import GameDetailPage from './pages/GameDetailPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<UserLibraryPage />} />
            <Route path="/game/:id" element={<GameDetailPage />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              WhatShouldIPlay v2.0 - Powered by Steam & GiantBomb APIs
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Modern rebuild with React, TypeScript, and Node.js
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
