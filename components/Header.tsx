import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettingsStore, setLanguage, Language } from '../state/settingsStore';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { subscribe, getSnapshot } = useSettingsStore();
  const [currentLanguage, setCurrentLanguage] = useState(getSnapshot().language);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setCurrentLanguage(getSnapshot().language);
    });
    return unsubscribe;
  }, [subscribe, getSnapshot]);

  const languages: { code: Language, name: string, native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  ];

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };
  
  const selectedLanguage = languages.find(l => l.code === currentLanguage);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <i className="ri-global-line text-xl"></i>
        <span className="hidden sm:inline">{selectedLanguage?.name}</span>
        <i className={`ri-arrow-down-s-line transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-36 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
          <ul>
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                >
                  {lang.native}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-lg pb-1 transition-colors duration-300 ${
      isActive
        ? 'text-gray-900 border-b-2 border-gray-900 dark:text-white dark:border-blue-400'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
    }`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-lg transition-colors duration-300 ${
      isActive
        ? 'text-gray-900 font-bold dark:text-white'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
    }`;


  return (
    <header className="bg-white/80 dark:bg-[#1f2937]/50 backdrop-blur-sm sticky top-0 z-[2000] shadow-lg dark:shadow-black/20">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative">
        <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-3">
              <i className="ri-earth-line text-3xl text-gray-800 dark:text-blue-400"></i>
              <h1 className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
                COSMOSCOPE
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/earth"
            className={navLinkClasses}
          >
            Earth
          </NavLink>
          <NavLink
            to="/mars"
            className={navLinkClasses}
          >
            Mars
          </NavLink>
          <NavLink
            to="/about"
            className={navLinkClasses}
          >
            About
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open navigation menu">
            <i className="ri-menu-line text-3xl text-gray-900 dark:text-white"></i>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1f2937] md:hidden flex flex-col items-center space-y-4 py-4 shadow-lg">
              <NavLink
                to="/earth"
                className={mobileNavLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Earth
              </NavLink>
              <NavLink
                to="/mars"
                className={mobileNavLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Mars
              </NavLink>
              <NavLink
                to="/about"
                className={mobileNavLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>
            </div>
        )}
      </nav>
    </header>
  );
};

export default Header;