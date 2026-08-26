import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SessionProvider } from './lib/session';
import { RequireAuth } from './components/auth/RequireAuth';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreatorsPage } from './pages/CreatorsPage';
import { PublicArtistPage } from './pages/PublicArtistPage';
import { ArtspacePage } from './pages/ArtspacePage';
import { MyWorksPage } from './pages/MyWorksPage';
import { InterestPage } from './pages/InterestPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { MessagesPage } from './pages/MessagesPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { AddArtworkPage } from './pages/AddArtworkPage';
import { ArtworkRecordPage } from './pages/ArtworkRecordPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/artists" element={<CreatorsPage />} />
        {/* An artist's public profile, reached by the handle they chose in
            ArtSpace → Public Profile → Profile Settings. */}
        <Route path="/artists/:handle" element={<PublicArtistPage />} />
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
            One guard covers the whole tree: anyone without a session is sent
            to /login and returned here once they're in. */}
        <Route element={<RequireAuth><Outlet /></RequireAuth>}>
          <Route path="/artspace" element={<ArtspacePage />} />
          <Route path="/artspace/works" element={<MyWorksPage />} />
          <Route path="/artspace/works/new" element={<AddArtworkPage />} />
          {/* Artwork record / Passport — docs/pivot-checklist/11-artwork-record-passport.md */}
          <Route path="/artspace/works/:id" element={<ArtworkRecordPage />} />
          <Route path="/artspace/interest" element={<InterestPage />} />
          <Route path="/artspace/opportunities" element={<OpportunitiesPage />} />
          <Route path="/artspace/messages" element={<MessagesPage />} />
          <Route path="/artspace/profile" element={<PublicProfilePage />} />
          <Route path="/artspace/billing" element={<ComingSoonPage title="Billing" />} />
          <Route path="/artspace/privacy" element={<ComingSoonPage title="Privacy" />} />
          <Route path="/artspace/security" element={<ComingSoonPage title="Security" />} />
          <Route path="/artspace/help" element={<ComingSoonPage title="Help Center" />} />
        </Route>

        {/* Legal — see docs/pivot-checklist/05-footer-and-legal.md, the
            footer's biggest source of dead links before these existed. */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />

        {/* One auth card, opened on the side the route names. */}
        <Route path="/login" element={<AuthPage mode="signin" />} />
        <Route path="/register" element={<AuthPage mode="signup" />} />
        {/* The Header still links here from the CareerBank flow. */}
        <Route path="/apply" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<ComingSoonPage title="This page" />} />
      </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
