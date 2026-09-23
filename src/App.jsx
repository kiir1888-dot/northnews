import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import BackToTopButton, { ScrollToTop } from './components/ScrollHelpers';
import Home from './pages/Home';
import Article from './pages/Article';
import Category from './pages/Category';
import About from './pages/About';
import Contact from './pages/Contact';
import EditorialPolicy from './pages/EditorialPolicy';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

/**
 * App shell — persistent header/footer with a routed main region.
 * A skip link is provided for keyboard and screen-reader users.
 */
export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/editorial-policy" element={<EditorialPolicy />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <BackToTopButton />
      <CookieConsent />
    </div>
  );
}
