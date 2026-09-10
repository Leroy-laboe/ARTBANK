import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SessionProvider } from './lib/session';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireNonGuardian } from './components/auth/RequireNonGuardian';
import { WorkspaceHome } from './components/auth/WorkspaceHome';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreatorsPage } from './pages/CreatorsPage';
import { PublicArtistPage } from './pages/PublicArtistPage';
import { SmartArtworkLinkPage } from './pages/SmartArtworkLinkPage';
import { ProfessionalPackPage } from './pages/ProfessionalPackPage';
import { ArtspacePage } from './pages/ArtspacePage';
import { MyWorksPage } from './pages/MyWorksPage';
import { InterestPage } from './pages/InterestPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { MessagesPage } from './pages/MessagesPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { AddArtworkPage } from './pages/AddArtworkPage';
import { ArtworkRecordPage } from './pages/ArtworkRecordPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { BuyerArtistsPage } from './pages/BuyerArtistsPage';
import { BuyerArtworkPage } from './pages/BuyerArtworkPage';
import { SavedWorksPage } from './pages/SavedWorksPage';
import { FollowingPage } from './pages/FollowingPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { MyEnquiriesPage } from './pages/MyEnquiriesPage';
import { BuyerMessagesPage } from './pages/BuyerMessagesPage';
import { ViewingRoomsPage } from './pages/ViewingRoomsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ArtspaceComingSoonPage } from './pages/ArtspaceComingSoonPage';
import { BuyerComingSoonPage } from './pages/BuyerComingSoonPage';
import { GuardianSettingsPage } from './pages/GuardianSettingsPage';
import { GuardianRequestsPage } from './pages/GuardianRequestsPage';
import { GuardianMinorViewPage } from './pages/GuardianMinorViewPage';
import { MyRoomsPage } from './pages/MyRoomsPage';
import { RoomBuilderPage } from './pages/RoomBuilderPage';
import { PublicViewingRoomPage } from './pages/PublicViewingRoomPage';
import { PricingPage } from './pages/PricingPage';

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
        {/* A private viewing room's shareable link — docs/pivot-checklist/
            21-feature-private-viewing-room.md. Outside RequireAuth on
            purpose: a room that doesn't require identity has to open for a
            signed-out visitor, so the gate lives inside the page itself. */}
        <Route path="/rooms/:id" element={<PublicViewingRoomPage />} />
        {/* The Smart Artwork Link — docs/pivot-checklist/
            19-feature-smart-artwork-link-qr.md. Also outside RequireAuth: the
            entire point is a link someone with no account can open. */}
        <Route path="/a/:id" element={<SmartArtworkLinkPage />} />
        <Route path="/how-it-works" element={<ComingSoonPage title="How It Works" />} />
        <Route path="/for-buyers" element={<ComingSoonPage title="For Buyers" />} />
        <Route path="/pricing" element={<PricingPage />} />
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
          {/* The buyer workspace — the other side of ArtSpace. Same guard,
              same session; which of the two an account belongs in is decided
              by WorkspaceHome from users.role. */}
          <Route path="/workspace" element={<WorkspaceHome />} />
          {/* Approving a guardian request: reachable from either workspace's
              account menu, since a guardian is just as often an existing
              artist or buyer as a dedicated account. Every role can reach
              these two — a pure guardian account is blocked from the other
              routes below instead (see RequireNonGuardian). */}
          <Route path="/guardian" element={<GuardianRequestsPage />} />
          {/* Read-only oversight of a specific minor's account, once
              approved — docs/pivot-checklist's guardian scope plus the
              "fuller dashboard" this session extended it to. */}
          <Route path="/guardian/:minorId" element={<GuardianMinorViewPage />} />

          {/* A pure guardian account has no artist or buyer business at all,
              so everything below is blocked for that role — see
              RequireNonGuardian's own comment for why this needs to be a
              real guard and not just where WorkspaceHome happens to send
              someone after sign-in. */}
          <Route element={<RequireNonGuardian><Outlet /></RequireNonGuardian>}>
            <Route path="/artspace" element={<ArtspacePage />} />
            <Route path="/artspace/works" element={<MyWorksPage />} />
            <Route path="/artspace/works/new" element={<AddArtworkPage />} />
            {/* Artwork record / Passport — docs/pivot-checklist/11-artwork-record-passport.md */}
            <Route path="/artspace/works/:id" element={<ArtworkRecordPage />} />
            {/* One-Click Professional Pack — a print-ready page instead of a
                PDF this project has no server to render. */}
            <Route path="/artspace/works/:id/pack" element={<ProfessionalPackPage />} />
            <Route path="/artspace/interest" element={<InterestPage />} />
            <Route path="/artspace/opportunities" element={<OpportunitiesPage />} />
            <Route path="/artspace/messages" element={<MessagesPage />} />
            <Route path="/artspace/profile" element={<PublicProfilePage />} />
            <Route path="/artspace/billing" element={<ArtspaceComingSoonPage title="Billing" />} />
            {/* Names the guardian who has to approve contact if this account
                belongs to someone under 18 — docs/pivot-checklist/15-messages.md. */}
            <Route path="/artspace/guardian" element={<GuardianSettingsPage />} />
            {/* Private Viewing Rooms — docs/pivot-checklist/
                21-feature-private-viewing-room.md. /rooms/new and /rooms/:id
                share one builder; the public link lives at /rooms/:id
                (outside this guard) rather than /artspace/rooms/:id. */}
            <Route path="/artspace/rooms" element={<MyRoomsPage />} />
            <Route path="/artspace/rooms/new" element={<RoomBuilderPage />} />
            <Route path="/artspace/rooms/:id" element={<RoomBuilderPage />} />
            <Route path="/artspace/help" element={<ArtspaceComingSoonPage title="Help Center" />} />

            <Route path="/collect" element={<DiscoverPage />} />
            <Route path="/collect/artists" element={<BuyerArtistsPage />} />
            <Route path="/collect/artworks/:id" element={<BuyerArtworkPage />} />
            <Route path="/collect/saved" element={<SavedWorksPage />} />
            <Route path="/collect/following" element={<FollowingPage />} />
            <Route path="/collect/purchases" element={<PurchasesPage />} />
            <Route path="/collect/enquiries" element={<MyEnquiriesPage />} />
            <Route path="/collect/messages" element={<BuyerMessagesPage />} />
            <Route path="/collect/rooms" element={<ViewingRoomsPage />} />
            <Route path="/collect/help" element={<BuyerComingSoonPage title="Help Center" />} />
          </Route>
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
