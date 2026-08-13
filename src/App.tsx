import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreatorsPage } from './pages/CreatorsPage';
import { MriRankingsPage } from './pages/MriRankingsPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/creators" element={<CreatorsPage />} />
        <Route path="/mri-rankings" element={<MriRankingsPage />} />
        <Route path="/archive" element={<ComingSoonPage title="ARTCHIVE" />} />
        <Route path="/articon" element={<ComingSoonPage title="ARTICON" />} />
        <Route path="/academy" element={<ComingSoonPage title="ARTCADEMY" />} />
        <Route path="/membership" element={<ComingSoonPage title="Membership" />} />
        {/* One auth card, opened on the side the route names. */}
        <Route path="/login" element={<AuthPage mode="signin" />} />
        <Route path="/register" element={<AuthPage mode="signup" />} />
        {/* The Header still links here from the CareerBank flow. */}
        <Route path="/apply" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<ComingSoonPage title="This page" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
