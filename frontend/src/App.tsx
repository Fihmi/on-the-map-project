import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InteractiveBackground } from './components/ui/InteractiveBackground';

// Lazy-load route-level components so their JS chunks are never part of
// the critical path — they are fetched in parallel once React has booted.
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

// Minimal fallback that matches the critical CSS shell — keeps the dark
// background steady and shows a lightweight spinner while the route chunk loads.
const PageShell = () => (
  <div
    style={{
      minHeight: '100vh',
      background: '#0a0f1c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  />
);

function App() {
  return (
    <>
      <InteractiveBackground />
      <BrowserRouter>
        <Suspense fallback={<PageShell />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
