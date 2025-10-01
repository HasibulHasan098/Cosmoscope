import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMarsPhotos } from '../services/nasaService';
import { getMarsAnswer, analyzeMarsImage } from '../services/geminiService';
import { useChatStore, addMarsMessage, setMarsMessages } from '../state/chatStore';
import { useSettingsStore } from '../state/settingsStore';
import { fileToBase64 } from '../utils/imageUtils';
import type { NasaPhoto, ChatMessage } from '../types';
import ImageGallery from '../components/ImageGallery';
import ImageModal from '../components/ImageModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Chat from '../components/Chat';

const DEFAULT_SOL = 3000;

const MarsPage: React.FC = () => {
  const [photos, setPhotos] = useState<NasaPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [currentSol, setCurrentSol] = useState<number>(DEFAULT_SOL);
  const [searchSol, setSearchSol] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<NasaPhoto | null>(null);
  
  const { subscribe, getSnapshot } = useChatStore();
  const [chatMessages, setChatMessagesState] = useState(getSnapshot().marsMessages);
  
  const { subscribe: subscribeSettings, getSnapshot: getSettingsSnapshot } = useSettingsStore();
  const [language, setLanguage] = useState(getSettingsSnapshot().language);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setChatMessagesState(getSnapshot().marsMessages);
    });
    const unsubscribeSettings = subscribeSettings(() => {
        setLanguage(getSettingsSnapshot().language);
    });
    return () => {
        unsubscribe();
        unsubscribeSettings();
    };
  }, [subscribe, getSnapshot, subscribeSettings, getSettingsSnapshot]);

  // Translate initial message if language changes
  useEffect(() => {
    const { marsMessages } = getSnapshot();
    if (marsMessages.length === 1 && marsMessages[0].role === 'model') {
        const initialEnglish = "Greetings! I am the Mars Exploration AI. Ask me anything about the Red Planet.";
        const initialBengali = "শুভেচ্ছা! আমি মঙ্গল অন্বেষণ এআই। আমাকে লাল গ্রহ সম্পর্কে কিছু জিজ্ঞাসা করুন।";
        
        if (marsMessages[0].parts[0].text === initialEnglish || marsMessages[0].parts[0].text === initialBengali) {
             const newInitialText = language === 'bn' ? initialBengali : initialEnglish;
             if (marsMessages[0].parts[0].text !== newInitialText) {
                setMarsMessages([{ role: 'model', parts: [{ text: newInitialText }] }]);
             }
        }
    }
  }, [language, getSnapshot]);


  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const loadPhotos = useCallback(async (sol: number, pageNum: number) => {
    const loader = pageNum === 1 ? setIsLoading : setIsMoreLoading;
    loader(true);
    setError('');

    try {
      const roverPhotos = await fetchMarsPhotos(sol, pageNum);
      if (pageNum === 1) {
        setPhotos(roverPhotos);
      } else {
        setPhotos(prev => [...prev, ...roverPhotos]);
      }
      
      if (roverPhotos.length === 0) {
        setHasMore(false);
        if (pageNum === 1) {
            setError(`No photos found for Sol ${sol}. The rover might have been resting.`);
        }
      } else {
        setHasMore(true);
        setPage(pageNum);
      }
    } catch (err) {
      setError('Failed to fetch photos from NASA. Please try again later.');
    } finally {
      loader(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos(currentSol, 1);
  }, [currentSol, loadPhotos]);
  
  const handleLoadMore = () => {
      if (isMoreLoading || !hasMore) return;
      loadPhotos(currentSol, page + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const solValue = parseInt(searchSol, 10);
    if (!isNaN(solValue) && solValue > 0) {
        setCurrentSol(solValue);
        setPage(1);
        setPhotos([]);
        setHasMore(true);
    } else {
        setError("Please enter a valid Sol number (e.g., 1000).")
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    addMarsMessage(userMessage);
    setIsChatLoading(true);

    try {
        const responseText = await getMarsAnswer(message, language);
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
        addMarsMessage(modelMessage);
    } catch (error) {
        console.error("Error getting Mars answer:", error);
        const text = language === 'bn' 
            ? "মঙ্গল গ্রহ থেকে সংযোগ করতে আমার সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "I seem to be having trouble communicating from Mars. Please try again.";
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text }] };
        addMarsMessage(errorMessage);
    } finally {
        setIsChatLoading(false);
    }
  }, [language]);
  
  const handleImageUpload = useCallback(async (file: File) => {
    setIsChatLoading(true);
    const base64Data = await fileToBase64(file);
    addMarsMessage({ role: 'user', parts: [{ inlineData: { mimeType: file.type, data: base64Data } }] });
    
    try {
        const responseText = await analyzeMarsImage(base64Data, language);
        addMarsMessage({ role: 'model', parts: [{ text: responseText }] });
    } catch (error) {
        console.error("Error analyzing Mars image:", error);
        const text = language === 'bn' 
            ? "ছবিটি বিশ্লেষণ করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "An error occurred while analyzing the image. Please try again.";
        addMarsMessage({ role: 'model', parts: [{ text }] });
    } finally {
        setIsChatLoading(false);
    }
  }, [language]);

  const defaultSuggestions = useMemo(() => (language === 'bn' ? [
    "কিউরিওসিটি রোভার সম্পর্কে বলুন",
    "মঙ্গলে 'সল' কী?",
    "অলিম্পাস মনস কোথায়?",
  ] : [
    "Tell me about the Curiosity rover",
    "What is a 'Sol' on Mars?",
    "Where is Olympus Mons?",
  ]), [language]);


  return (
    <>
      <div className="container mx-auto p-6">
        <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2 text-red-600 dark:text-red-300">Mars Rover Gallery</h1>
            <p className="text-gray-600 dark:text-gray-400">Images from the Curiosity Rover</p>
        </div>

        <form onSubmit={handleSearch} className="flex justify-center items-center gap-2 mb-8 max-w-sm mx-auto">
            <input 
                type="number"
                value={searchSol}
                onChange={(e) => setSearchSol(e.target.value)}
                placeholder="Enter Sol (e.g., 1000)"
                className="flex-grow bg-gray-200 dark:bg-[#374151] rounded-full py-2 px-4 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-blue-500 transition"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 hover:bg-gray-900 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 rounded-full p-2 text-white transition-colors flex items-center justify-center w-10 h-10"
            >
                <i className="ri-search-line"></i>
            </button>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
            <span className="ml-4 text-xl">Loading Martian Surface...</span>
          </div>
        )}
        {error && !isLoading && <p className="text-center text-red-500 dark:text-red-400 py-8">{error}</p>}
        {!isLoading && photos.length > 0 && (
          <>
            <ImageGallery photos={photos} onImageSelect={setSelectedPhoto} />
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isMoreLoading}
                  className="bg-gray-800 hover:bg-gray-900 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  {isMoreLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Load More Photos'
                  )}
                </button>
              </div>
            )}
            {!hasMore && (
              <p className="text-center text-gray-500 mt-8">You've reached the end of the gallery for this Sol.</p>
            )}
          </>
        )}
        <ImageModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </div>
      
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gray-800 dark:bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-gray-900 dark:hover:bg-blue-700 transition-transform hover:scale-110"
          >
            <i className="ri-question-answer-fill text-3xl"></i>
          </button>
        </div>
      )}
      
      {/* Chat Modal/Sheet */}
      {isChatOpen && (
         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-end md:justify-end md:bg-transparent md:p-5">
              <div className="w-full md:w-[400px] h-[75vh] md:h-[500px] bg-transparent flex flex-col">
                  <Chat
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isLoading={isChatLoading}
                      title="Mars Exploration AI"
                      placeholder={language === 'bn' ? "মঙ্গল সম্পর্কে জিজ্ঞাসা করুন..." : "Ask about Mars..."}
                      onClose={() => setIsChatOpen(false)}
                      onImageUpload={handleImageUpload}
                      chatContext="mars"
                      defaultSuggestions={defaultSuggestions}
                  />
              </div>
         </div>
      )}
    </>
  );
};

export default MarsPage;