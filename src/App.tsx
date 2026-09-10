import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SessionProvider } from './lib/session';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireNonGuardian } from './components/auth/RequireNonGuardian';
import { WorkspaceHome } from './components/auth/WorkspaceHome';
import { RouteFallback } from './components/ui/RouteFallback';

/* ── Eagerly loaded ────────────────────────────────────────────────────────
 * Only the surfaces someone can land on cold, where a chunk round-trip would
 * sit between them and the first paint: the marketing homepage, the auth
 * card, and the three public links that get opened from a QR code, a shared
 * URL or a search result by people with no session and no warmed cache.
 * ComingSoonPage is here too — it backs the catch-all route and is small
 * enough that splitting it would cost more than it saves. */
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { SmartArtworkLinkPage } from './pages/SmartArtworkLinkPage';
import { PublicViewingRoomPage } from './pages/PublicViewingRoomPage';
import { PublicArtistPage } from './pages/PublicArtistPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

/* ── Lazily loaded ─────────────────────────────────────────────────────────
 * Everything behind a sign-in, plus the secondary marketing pages. A visitor
 * reading the homepage has no reason to download the artist dashboard, the
 * buyer workspace or the guardian screens, and before this split they
 * downloaded all three.
 *
 * Pages use named exports and React.lazy wants a default, hence the small
 * unwrap on each line. */
const MarketplacePage = lazy(async () => ({ default: (await import('./pages/MarketplacePage')).MarketplacePage }));
const CreatorsPage = lazy(async () => ({ default: (await import('./pages/CreatorsPage')).CreatorsPage }));
const PricingPage = lazy(async () => ({ default: (await import('./pages/PricingPage')).PricingPage }));
const TermsPage = lazy(async () => ({ default: (await import('./pages/TermsPage')).TermsPage }));
const PrivacyPage = lazy(async () => ({ default: (await import('./pages/PrivacyPage')).PrivacyPage }));
const CookiePolicyPage = lazy(async () => ({ default: (await import('./pages/CookiePolicyPage')).CookiePolicyPage }));

const ArtspacePage = lazy(async () => ({ default: (await import('./pages/ArtspacePage')).ArtspacePage }));
const MyWorksPage = lazy(async () => ({ default: (await import('./pages/MyWorksPage')).MyWorksPage }));
const AddArtworkPage = lazy(async () => ({ default: (await import('./pages/AddArtworkPage')).AddArtworkPage }));
const ArtworkRecordPage = lazy(async () => ({ default: (await import('./pages/ArtworkRecordPage')).ArtworkRecordPage }));
const ProfessionalPackPage = lazy(async () => ({ default: (await import('./pages/ProfessionalPackPage')).ProfessionalPackPage }));
const InterestPage = lazy(async () => ({ default: (await import('./pages/InterestPage')).InterestPage }));
const OpportunitiesPage = lazy(async () => ({ default: (await import('./pages/OpportunitiesPage')).OpportunitiesPage }));
const MessagesPage = lazy(async () => ({ default: (await import('./pages/MessagesPage')).MessagesPage }));
const PublicProfilePage = lazy(async () => ({ default: (await import('./pages/PublicProfilePage')).PublicProfilePage }));
const ArtspaceComingSoonPage = lazy(async () => ({ default: (await import('./pages/ArtspaceComingSoonPage')).ArtspaceComingSoonPage }));
const GuardianSettingsPage = lazy(async () => ({ default: (await import('./pages/GuardianSettingsPage')).GuardianSettingsPage }));
const MyRoomsPage = lazy(async () => ({ default: (await import('./pages/MyRoomsPage')).MyRoomsPage }));
const RoomBuilderPage = lazy(async () => ({ default: (await import('./pages/RoomBuilderPage')).RoomBuilderPage }));

const DiscoverPage = lazy(async () => ({ default: (await import('./pages/DiscoverPage')).DiscoverPage }));
const BuyerArtistsPage = lazy(async () => ({ default: (await import('./pages/BuyerArtistsPage')).BuyerArtistsPage }));
const BuyerArtworkPage = lazy(async () => ({ default: (await import('./pages/BuyerArtworkPage')).BuyerArtworkPage }));
const SavedWorksPage = lazy(async () => ({ default: (await import('./pages/SavedWorksPage')).SavedWorksPage }));
const FollowingPage = lazy(async () => ({ default: (await import('./pages/FollowingPage')).FollowingPage }));
const PurchasesPage = lazy(async () => ({ default: (await import('./pages/PurchasesPage')).PurchasesPage }));
const MyEnquiriesPage = lazy(async () => ({ default: (await import('./pages/MyEnquiriesPage')).MyEnquiriesPage }));
const BuyerMessagesPage = lazy(async () => ({ default: (await import('./pages/BuyerMessagesPage')).BuyerMessagesPage }));
const ViewingRoomsPage = lazy(async () => ({ default: (await import('./pages/ViewingRoomsPage')).ViewingRoomsPage }));
const BuyerComingSoonPage = lazy(async () => ({ default: (await import('./pages/BuyerComingSoonPage')).BuyerComingSoonPage }));

const GuardianRequestsPage = lazy(async () => ({ default: (await import('./pages/GuardianRequestsPage')).GuardianRequestsPage }));
const GuardianMinorViewPage = lazy(async () => ({ default: (await import('./pages/GuardianMinorViewPage')).GuardianMinorViewPage }));

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
      {/* One boundary around the whole table rather than per route: the
          fallback is identical everywhere, and nesting them would only add
          places for a chunk to flash. */}
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
