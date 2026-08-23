import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LegalDocument } from '../components/legal/LegalDocument';
import { privacyContent } from '../data/legalContent';

export function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <LegalDocument doc={privacyContent} />
      </main>
      <Footer />
    </>
  );
}
