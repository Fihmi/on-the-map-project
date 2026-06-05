import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { InteractiveBackground } from './components/ui/InteractiveBackground';
import { Preloader } from './components/ui/Preloader';
import { tripsData } from './data/trips';

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

const staticImages = [
  '/images/Post - traveland.png',
  '/images/Post - igv.jpg',
  '/images/insta icon - traveland.jpeg',
  '/images/insta icon - igv.jpeg',
];

const preloadImagesList = [
  'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1548625361-ec06a202cdd4?auto=format&fit=crop&q=80',
  ...staticImages,
  ...tripsData.map((trip) => trip.images[0]).filter(Boolean),
];

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <Preloader
            images={preloadImagesList}
            onComplete={() => setIsLoaded(true)}
          />
        )}
      </AnimatePresence>

      {isLoaded && (
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
      )}
    </>
  );
}

export default App;
