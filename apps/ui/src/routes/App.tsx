import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/loading-spinner/loading-spinner';
import { Home } from '../pages/Home';
import './app.css';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Workout tracker</h1>
        </div>
      </header>

      <main className="app-main">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
