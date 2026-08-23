import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { LegalDocument } from '../components/legal/LegalDocument';
import { cookiesContent } from '../data/legalContent';

export function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main>
        <LegalDocument doc={cookiesContent} />
      </main>
      <Footer />
    </>
  );
}
