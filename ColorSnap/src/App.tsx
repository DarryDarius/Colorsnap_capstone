import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Result from './pages/Result';
import Consultation from './pages/Consultation';
import ShoppingCart from './pages/ShoppingCart';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import ProductDetail from './pages/ProductDetail';
import SharedResult from './pages/SharedResult';
import Login from './pages/Login';
import Register from './pages/Register';
import MyResults from './pages/MyResults';
import SavedLooks from './pages/SavedLooks';

const GlobalStyle = createGlobalStyle`
  :root {
    /* Modern Beauty Editorial Tokens */
    --bg-page: #FFFCFA;
    --bg-soft: #F8F3F4;
    --bg-lifted: #F9FAF7;
    --surface: #FFFFFF;
    --surface-warm: #FFF7F5;
    --surface-sage: #F2F6F1;

    --text-primary: #181414;
    --text-secondary: #6E6460;
    --text-muted: #9A8F8A;
    --text-inverse: #FFFFFF;

    --brand-primary: #D8647A;
    --brand-primary-hover: #C65368;
    --brand-primary-soft: #F4D6DC;
    --brand-primary-pale: #FBEEF1;

    --accent-clay: #9D6B53;
    --accent-sage: #7E8A6A;
    --accent-olive: #69734D;
    --accent-gold: #C69A4A;

    --border-soft: #E8DEDA;
    --border-strong: #D8C9C3;

    --success: #507A5A;
    --warning: #B87931;
    --error: #B42318;
    --info: #3E738F;

    --shadow-soft: 0 8px 24px rgba(56, 35, 28, 0.06);
    --shadow-medium: 0 14px 36px rgba(56, 35, 28, 0.1);

    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.5rem;
    --space-6: 2rem;
    --space-7: 3rem;
    --space-8: 4rem;
    --space-9: 6rem;

    --container-sm: 760px;
    --container-md: 1040px;
    --container-lg: 1200px;

    --font-xs: 0.75rem;
    --font-sm: 0.875rem;
    --font-md: 1rem;
    --font-lg: 1.125rem;
    --font-xl: 1.5rem;
    --font-2xl: 2rem;
    --font-3xl: 2.75rem;
    --font-4xl: 4rem;

    /* Backwards-compatible aliases for pages still awaiting visual polish */
    --primary-rose: var(--brand-primary);
    --primary-rose-dark: var(--brand-primary-hover);
    --primary-rose-light: var(--brand-primary-soft);
    --primary-rose-pale: var(--brand-primary-pale);
    --secondary-gold: var(--accent-gold);
    --secondary-gold-dark: #A67D32;
    --secondary-gold-light: #D8B96A;
    --neutral-white: var(--surface);
    --neutral-off-white: var(--bg-soft);
    --neutral-light-gray: #EEE8E6;
    --neutral-gray: var(--border-soft);
    --neutral-dark-gray: var(--text-secondary);
    --neutral-black: var(--text-primary);
    --text-light: var(--text-muted);
    --text-white: var(--text-inverse);
    --bg-primary: var(--bg-page);
    --bg-secondary: var(--bg-soft);
    --bg-accent: var(--brand-primary-pale);
    --shadow-light: var(--shadow-soft);
    --shadow-heavy: var(--shadow-medium);
    --radius-small: var(--radius-sm);
    --radius-medium: var(--radius-md);
    --radius-large: var(--radius-lg);
    --radius-pill: var(--radius-md);
    --spacing-xs: var(--space-2);
    --spacing-sm: var(--space-4);
    --spacing-md: var(--space-5);
    --spacing-lg: var(--space-6);
    --spacing-xl: var(--space-7);
    --spacing-xxl: var(--space-8);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--bg-page);
    color: var(--text-primary);
    line-height: 1.6;
    font-weight: 400;
    letter-spacing: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
    letter-spacing: 0;
    transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-soft);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--brand-primary-soft);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--brand-primary);
  }

  ::selection {
    background: var(--brand-primary-soft);
    color: var(--text-primary);
  }

  *:focus {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  .luxury-gradient {
    background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-soft) 100%);
  }

  .rose-gradient {
    background: var(--brand-primary);
  }

  .gold-gradient {
    background: var(--accent-gold);
  }

  /* Utility classes */
  .text-primary { color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); }
  .text-light { color: var(--text-light); }
  .text-white { color: var(--text-white); }
  
  .bg-primary { background-color: var(--bg-primary); }
  .bg-secondary { background-color: var(--bg-secondary); }
  .bg-accent { background-color: var(--bg-accent); }
  
  .shadow-light { box-shadow: var(--shadow-light); }
  .shadow-medium { box-shadow: var(--shadow-medium); }
  .shadow-heavy { box-shadow: var(--shadow-heavy); }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
`;

const MainContent = styled.main`
  flex: 1;
  margin-top: 72px;
`;

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <GlobalStyle />
        <AppContainer>
          <Header />
          <MainContent>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/result" element={<Result />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/shopping-cart" element={<ShoppingCart />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/share/:shareId" element={<SharedResult />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-results" element={<MyResults />} />
              <Route path="/saved-looks" element={<SavedLooks />} />
            </Routes>
          </MainContent>
          <Footer />
        </AppContainer>
      </AuthProvider>
    </Router>
  );
}

export default App;
