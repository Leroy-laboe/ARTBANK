import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LegalDocument } from '../components/legal/LegalDocument';
import { termsContent } from '../data/legalContent';

export function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <LegalDocument doc={termsContent} />
      </main>
      <Footer />
    </>
  );
}
