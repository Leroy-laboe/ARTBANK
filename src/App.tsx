import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreatorsPage } from './pages/CreatorsPage';
import { ArtspacePage } from './pages/ArtspacePage';
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
        <Route path="/archive" element={<ComingSoonPage title="ARTCHIVE" />} />
        <Route path="/articon" element={<ComingSoonPage title="ARTICON" />} />
        <Route path="/academy" element={<ComingSoonPage title="ARTCADEMY" />} />
        {/* ArtSpace — the private area an artist lands on after signing in.
            Today is built; the other four destinations and the account menu
            are placeholders until their own milestones land. */}
        <Route path="/artspace" element={<ArtspacePage />} />
        <Route path="/artspace/works" element={<ComingSoonPage title="My Works" />} />
        <Route path="/artspace/works/new" element={<ComingSoonPage title="Add Artwork" />} />
        <Route path="/artspace/interest" element={<ComingSoonPage title="Interest" />} />
        <Route path="/artspace/opportunities" element={<ComingSoonPage title="Opportunities" />} />
        <Route path="/artspace/messages" element={<ComingSoonPage title="Messages" />} />
        <Route path="/artspace/profile" element={<ComingSoonPage title="Public Profile" />} />
        <Route path="/artspace/billing" element={<ComingSoonPage title="Billing" />} />
        <Route path="/artspace/privacy" element={<ComingSoonPage title="Privacy" />} />
        <Route path="/artspace/security" element={<ComingSoonPage title="Security" />} />
        <Route path="/artspace/help" element={<ComingSoonPage title="Help Center" />} />

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
