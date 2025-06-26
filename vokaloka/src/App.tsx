import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import FlashcardPage from './pages/FlashcardPage';
import NewCardsPage from './pages/Learning/LearnPage'; // ✅ NEW import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/review" element={<FlashcardPage />} />
        <Route path="/learn" element={<NewCardsPage />} /> {/* ✅ NEW route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;



