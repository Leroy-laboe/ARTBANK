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
        <Route path="/artists" element={<CreatorsPage />} />
        {/* "Creators" was renamed to "Artists" in the nav; keep the old path
            working for anything still pointing at it. */}
        <Route path="/creators" element={<Navigate to="/artists" replace />} />
        <Route path="/how-it-works" element={<ComingSoonPage title="How It Works" />} />
        <Route path="/for-buyers" element={<ComingSoonPage title="For Buyers" />} />
        <Route path="/pricing" element={<ComingSoonPage title="Pricing" />} />
        {/* "Membership" became "Pricing" in the nav. */}
        <Route path="/membership" element={<Navigate to="/pricing" replace />} />

        {/* Hidden from the nav until functional — still routable by direct URL. */}
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/mri-rankings" element={<MriRankingsPage />} />
        <Route path="/archive" element={<ComingSoonPage title="ARTCHIVE" />} />
        <Route path="/articon" element={<ComingSoonPage title="ARTICON" />} />
        <Route path="/academy" element={<ComingSoonPage title="ARTCADEMY" />} />
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
