import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminPage } from './pages/AdminPage';
import { InteractiveBackground } from './components/ui/InteractiveBackground';

function App() {
  return (
    <>
      <InteractiveBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
