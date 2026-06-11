import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Dashboard from './components/Dashboard';
import ModulePage from './components/ModulePage';
import LessonPage from './components/LessonPage';
import ProjectsPage from './components/ProjectsPage';
import PrivacyPage from './components/PrivacyPage';
import { flatLessons } from './data';
import { lessonStatus, useProgress } from './lib/progress';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

type Theme = 'light' | 'dark';

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ailearn-theme', theme);
    } catch {
      // storage unavailable — theme just won't persist
    }
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) };
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        ☼
      </span>
      <span className="theme-toggle-icon" aria-hidden="true">
        ☾
      </span>
      <span className="theme-toggle-knob" data-theme={theme} aria-hidden="true" />
    </button>
  );
}

export default function App() {
  const progress = useProgress();
  const { theme, toggle } = useTheme();
  const done = flatLessons.filter(
    (fl) => lessonStatus(progress, fl.module.id, fl.lesson) === 'complete',
  ).length;
  const pct = Math.round((done / flatLessons.length) * 100);

  return (
    <div className="app">
      <ScrollToTop />
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ⚡
          </span>
          AILearn
          <span className="brand-sub">SWE → AI engineer</span>
        </Link>
        <div className="topbar-right">
          <Link to="/projects" className="topbar-link">
            Projects
          </Link>
          <div className="topbar-progress" title={`${pct}% of the course complete`}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="topbar-progress-label">
              {done}/{flatLessons.length}
            </span>
          </div>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/learn/:moduleId/:lessonId" element={<LessonPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>
          Curated from the best public resources — Karpathy, 3Blue1Brown, StatQuest, Stanford,
          original papers, and provider docs.
        </span>
        <span className="footer-note">
          All practice runs locally in your browser. · <Link to="/privacy">Privacy</Link>
        </span>
      </footer>
      <Analytics />
    </div>
  );
}
