import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        <Route path="*" element={<ComingSoonPage title="This page" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
