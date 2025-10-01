import React, { useState, useCallback, useEffect } from 'react';
import type { NasaPhoto } from '../types';
import { generateRoverStory } from '../services/geminiService';
import { useSettingsStore } from '../state/settingsStore';
import LoadingSpinner from './LoadingSpinner';

interface ImageModalProps {
  photo: NasaPhoto | null;
  onClose: () => void;
}

const translations = {
    en: {
        title: "AI Story Mode",
        generateButton: "Generate Rover's Story",
        loadingText: "The rover is remembering its journey...",
        errorText: "Failed to generate story. Please try again.",
        placeholder: "Click the button to generate a story from the rover's perspective."
    },
    bn: {
        title: "এআই স্টোরি মোড",
        generateButton: "রোভারের গল্প তৈরি করুন",
        loadingText: "রোভার তার যাত্রা স্মরণ করছে...",
        errorText: "গল্প তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
        placeholder: "রোভারের দৃষ্টিকোণ থেকে একটি গল্প তৈরি করতে বোতামে ক্লিক করুন।"
    }
};


const ImageModal: React.FC<ImageModalProps> = ({ photo, onClose }) => {
  const [story, setStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { subscribe, getSnapshot } = useSettingsStore();
  const [language, setLanguage] = useState(getSnapshot().language);

  useEffect(() => {
      const unsubscribe = subscribe(() => {
          setLanguage(getSnapshot().language);
      });
      return unsubscribe;
  }, [subscribe, getSnapshot]);
  
  const t = translations[language];

  const handleGenerateStory = useCallback(async () => {
    if (!photo) return;
    setIsLoading(true);
    setStory('');
    setError('');
    try {
      const generatedStory = await generateRoverStory(photo.img_src, language);
      setStory(generatedStory);
    } catch (err) {
      setError(t.errorText);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [photo, language, t.errorText]);

  useEffect(() => {
    // When the modal is opened with a new photo, reset the story state.
    setStory('');
    setError('');
    setIsLoading(false);
  }, [photo]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[3000] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-10 hover:bg-black/80 transition-colors">
          <i className="ri-close-line text-2xl"></i>
        </button>
        <div className="w-full h-1/2 lg:w-2/3 lg:h-full bg-black flex items-center justify-center">
          <img src={photo.img_src} alt={`Mars Rover by ${photo.rover.name}`} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="w-full h-1/2 lg:w-1/3 lg:h-full p-6 flex flex-col text-gray-700 dark:text-gray-300 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{photo.rover.name} Rover</h2>
          <div className="space-y-2 text-sm border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Earth Date:</span> {photo.earth_date}</p>
            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Sol:</span> {photo.sol}</p>
            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Camera:</span> {photo.camera.full_name} ({photo.camera.name})</p>
            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Status:</span> Rover was {photo.rover.status} at time of photo.</p>
          </div>

          <div className="flex-grow flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.title}</h3>
            <button
              onClick={handleGenerateStory}
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner /> : <i className="ri-quill-pen-line"></i>}
              {t.generateButton}
            </button>
            <div className="mt-4 bg-gray-100 dark:bg-[#0a0a0f] rounded-lg p-4 flex-grow min-h-[150px] lg:min-h-[200px] border border-gray-200 dark:border-gray-700">
              {isLoading && <p className="text-gray-500 dark:text-gray-400">{t.loadingText}</p>}
              {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
              {story && <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{story}</p>}
              {!isLoading && !story && !error && <p className="text-gray-500">{t.placeholder}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;