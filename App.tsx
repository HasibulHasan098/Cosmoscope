import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import EarthPage from './pages/EarthPage';
import MarsPage from './pages/MarsPage';
import AboutPage from './pages/AboutPage';
import { useSettingsStore } from './state/settingsStore';

const App: React.FC = () => {
  const { subscribe, getSnapshot } = useSettingsStore();
  
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = getSnapshot();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(); // Apply on initial load

    const unsubscribe = subscribe(applyTheme); // Subscribe to changes
    return unsubscribe;
  }, [subscribe, getSnapshot]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0f] flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/earth" element={<EarthPage />} />
            <Route path="/mars" element={<MarsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/" element={<Navigate to="/earth" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;