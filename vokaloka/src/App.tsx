import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import FlashcardPage from './pages/FlashcardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} /> {/* ✅ match path to Link below */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/review" element={<FlashcardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


