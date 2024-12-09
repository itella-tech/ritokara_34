import React from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { AudioLanguage } from '@/types/pdf';

interface HeaderProps {
  onReturnToList?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReturnToList }) => {
  const { currentLanguage, setLanguage } = useLanguageStore();

  const handleLanguageChange = (language: AudioLanguage) => {
    setLanguage(language);
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 
          className="text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
          onClick={onReturnToList}
        >
          RitoKara
        </h1>
        <div className="flex items-center gap-4">
          <button
            className={`px-3 py-1 rounded ${
              currentLanguage === 'en' ? 'bg-blue-500' : 'bg-gray-600'
            }`}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
          <button
            className={`px-3 py-1 rounded ${
              currentLanguage === 'zh' ? 'bg-blue-500' : 'bg-gray-600'
            }`}
            onClick={() => handleLanguageChange('zh')}
          >
            中文
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 