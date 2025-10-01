import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MapComponent from '../components/Map';
import Chat from '../components/Chat';
import MapSearchBar from '../components/MapSearchBar';
import { useChatStore, addEarthMessage, setEarthMessages } from '../state/chatStore';
import { useSettingsStore } from '../state/settingsStore';
import { getEarthAnswer, analyzeEarthImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import type { Location, ChatMessage, Route } from '../types';

const ROME_LOCATION: Location = { lat: 41.9028, lng: 12.4964 };
const WORLD_ZOOM = 5;
const CITY_ZOOM = 12;

const EarthPage: React.FC = () => {
    const [mapCenter, setMapCenter] = useState<Location>(ROME_LOCATION);
    const [mapZoom, setMapZoom] = useState<number>(WORLD_ZOOM);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [routePolyline, setRoutePolyline] = useState<Location[] | null>(null);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [hasLocated, setHasLocated] = useState<boolean>(false);

    const { subscribe, getSnapshot } = useChatStore();
    const [chatMessages, setChatMessagesState] = useState(getSnapshot().earthMessages);

    const { subscribe: subscribeSettings, getSnapshot: getSettingsSnapshot } = useSettingsStore();
    const [language, setLanguage] = useState(getSettingsSnapshot().language);

    useEffect(() => {
        const unsubscribe = subscribe(() => {
            setChatMessagesState(getSnapshot().earthMessages);
        });
        const unsubscribeSettings = subscribeSettings(() => {
            setLanguage(getSettingsSnapshot().language);
        });
        return () => {
            unsubscribe();
            unsubscribeSettings();
        };
    }, [subscribe, getSnapshot, subscribeSettings, getSettingsSnapshot]);
    
    const handleMapClick = useCallback(async (location: Location) => {
        setRoute(null); // Clear any existing route
        setRoutePolyline(null);
        setSelectedLocation(location);
        setMapCenter(location);
        setMapZoom(CITY_ZOOM);
        setIsChatLoading(true);

        try {
            // Reverse geocode to get a place name
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch location name');
            const data = await response.json();
            
            const locationName = data.display_name || `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`;
    
            const messageText = language === 'bn'
                ? `অবস্থান নির্বাচিত: ${locationName}`
                : `Location selected: ${locationName}`;
    
            const locationMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: messageText }],
            };
            addEarthMessage(locationMessage);
    
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            // Fallback to coordinates if API fails
            const locationName = `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`;
            const messageText = language === 'bn'
                ? `অবস্থান নির্বাচিত: ${locationName}`
                : `Location selected: ${locationName}`;
            addEarthMessage({ role: 'model', parts: [{ text: messageText }] });
        } finally {
            setIsChatLoading(false);
        }
    }, [language]);

    // Translate initial message if language changes and no location has been found yet.
    useEffect(() => {
        const { earthMessages } = getSnapshot();
        if (earthMessages.length === 1 && earthMessages[0].role === 'model' && !hasLocated) {
            const initialEnglish = "Welcome to the Earth Explorer! Attempting to find your location...";
            const initialBengali = "আর্থ এক্সপ্লোরারে স্বাগতম! আপনার অবস্থান খোঁজার চেষ্টা করা হচ্ছে...";
            const newInitialText = language === 'bn' ? initialBengali : initialEnglish;
            if (earthMessages[0].parts[0].text !== newInitialText) {
                setEarthMessages([{ role: 'model', parts: [{ text: newInitialText }] }]);
            }
        }
    }, [language, getSnapshot, hasLocated]);


    useEffect(() => {
        if (navigator.geolocation && !hasLocated) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation: Location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setHasLocated(true);
                    const locatedText = language === 'bn'
                        ? 'আপনার অবস্থান পাওয়া গেছে! আরও জানতে মানচিত্রে ক্লিক করুন বা আমাকে কিছু জিজ্ঞাসা করুন।'
                        : 'Your location has been found! Click the map or ask me anything to learn more.';
                    addEarthMessage({ role: 'model', parts: [{ text: locatedText }] });
                    setSelectedLocation(userLocation);
                    setMapCenter(userLocation);
                    setMapZoom(CITY_ZOOM);
                },
                (error) => {
                    console.warn(`Geolocation error: ${error.message}`);
                    setHasLocated(true);
                     const noLocationText = language === 'bn'
                        ? 'আপনার অবস্থান অ্যাক্সেস করা যায়নি। রোম থেকে শুরু হচ্ছে। অন্বেষণ করতে মানচিত্রে ক্লিক করুন!'
                        : 'Could not access your location. Defaulting to Rome. Click the map to explore!';
                    addEarthMessage({ role: 'model', parts: [{ text: noLocationText }] });
                    setSelectedLocation(ROME_LOCATION);
                    setMapCenter(ROME_LOCATION);
                    setMapZoom(WORLD_ZOOM);
                },
                { timeout: 10000 }
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRoutePolyline = useCallback(async (start: Location, end: Location) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch route');
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const routeCoords = data.routes[0].geometry.coordinates;
                // OSRM returns [lng, lat], Leaflet needs [lat, lng]
                const latLngPath = routeCoords.map((coord: [number, number]) => ({ lat: coord[1], lng: coord[0] }));
                setRoutePolyline(latLngPath);
            }
        } catch (error) {
            console.error("Error fetching route from OSRM:", error);
            // Fallback to straight line is handled in MapComponent
        }
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!selectedLocation && !route && !message.toLowerCase().includes('point out to')) {
            const text = language === 'bn' 
                ? "অনুগ্রহ করে একটি প্রশ্ন জিজ্ঞাসা করার আগে মানচিত্রে একটি অবস্থান নির্বাচন করুন।"
                : "Please select a location on the map before asking a question.";
            addEarthMessage({role: 'model', parts: [{text}]});
            return;
        }

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        addEarthMessage(userMessage);
        setIsChatLoading(true);
    
        try {
            const currentChatHistory = getSnapshot().earthMessages;
            const { text, sources } = await getEarthAnswer(currentChatHistory, language, selectedLocation, route);

            // Use a regex to find a JSON object within the response string.
            // This is more robust than a direct JSON.parse if the model adds conversational text.
            const jsonStringMatch = text.match(/\{[\s\S]*\}/);

            if (jsonStringMatch) {
                try {
                    const command = JSON.parse(jsonStringMatch[0]);
                    if (command.set_location?.lat && command.set_location?.lng) {
                        const { name, lat, lng } = command.set_location;
                        const confirmationText = language === 'bn' ? `অবশ্যই, এখানে ${name}।` : `Of course, here is ${name}.`;
                        addEarthMessage({ role: 'model', parts: [{ text: confirmationText }] });
                        
                        setRoute(null); // Clear any route
                        setRoutePolyline(null);
                        setSelectedLocation({ lat, lng });
                        setMapCenter({ lat, lng });
                        setMapZoom(CITY_ZOOM);
                    } else if (command.show_route) {
                        const { start, end, distance } = command.show_route;
                        const confirmationText = language === 'bn'
                            ? `${start.name} থেকে ${end.name} পর্যন্ত রুট দেখানো হচ্ছে। আনুমানিক দূরত্ব ${distance}।`
                            : `Showing the route from ${start.name} to ${end.name}. The approximate distance is ${distance}.`;
                        
                        addEarthMessage({ role: 'model', parts: [{ text: confirmationText }] });
    
                        setSelectedLocation(null); // Clear single selection
                        setRoutePolyline(null); // Clear old polyline
                        setRoute({ start, end });
                        fetchRoutePolyline(start, end);
    
                    } else {
                         // It was valid JSON but not a recognized command. Treat as text.
                        addEarthMessage({ role: 'model', parts: [{ text }], sources });
                    }
                } catch (e) {
                    // The extracted string was not valid JSON, treat the original response as text.
                    const modelMessage: ChatMessage = { role: 'model', parts: [{ text }], sources };
                    addEarthMessage(modelMessage);
                }
            } else {
                // No JSON-like string found, treat as a regular text response.
                const modelMessage: ChatMessage = { role: 'model', parts: [{ text }], sources };
                addEarthMessage(modelMessage);
            }
        } catch (error) {
            console.error("Error getting Earth answer:", error);
            const text = language === 'bn'
                ? "সংযোগ একটি সমস্যা আছে বলে মনে হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
                : "There seems to be a connection issue. Please try again.";
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text }] };
            addEarthMessage(errorMessage);
        } finally {
            setIsChatLoading(false);
        }
    }, [language, selectedLocation, route, getSnapshot, fetchRoutePolyline]);
    
    const handleImageUpload = useCallback(async (file: File) => {
        setIsChatLoading(true);
        const base64Data = await fileToBase64(file);
        addEarthMessage({ role: 'user', parts: [{ inlineData: { mimeType: file.type, data: base64Data } }] });
        
        try {
            const responseText = await analyzeEarthImage(base64Data, language);
            addEarthMessage({ role: 'model', parts: [{ text: responseText }] });
        } catch (error) {
            console.error("Error analyzing Earth image:", error);
            const text = language === 'bn'
                ? "ছবিটি বিশ্লেষণ করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
                : "An error occurred while analyzing the image. Please try again.";
            addEarthMessage({ role: 'model', parts: [{ text }] });
        } finally {
            setIsChatLoading(false);
        }
      }, [language]);
      
    const handleMapSearch = useCallback((placeName: string) => {
        if (placeName.trim()) {
            handleSendMessage(`Point out to "${placeName}"`);
        }
    }, [handleSendMessage]);

    const defaultSuggestions = useMemo(() => (language === 'bn' ? [
        "আমি এখন কোথায়?",
        "এখানকার আবহাওয়া কেমন?",
        "কাছাকাছি একটি পার্ক খুঁজুন",
    ] : [
        "Where am I right now?",
        "What's the weather like here?",
        "Find a park nearby",
    ]), [language]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:h-[calc(100vh-80px)] lg:overflow-hidden">
            <div className="relative h-[45vh] lg:h-full">
                <MapComponent
                    onLocationSelect={handleMapClick}
                    center={mapCenter}
                    zoom={mapZoom}
                    selectedLocation={selectedLocation}
                    route={route}
                    routePolyline={routePolyline}
                />
                <MapSearchBar onSearch={handleMapSearch} />
            </div>
            <div className="h-[75vh] lg:h-full lg:min-h-0">
                <Chat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isChatLoading}
                    title="Earth Explorer AI"
                    placeholder={language === 'bn' ? "পৃথিবী সম্পর্কে জিজ্ঞাসা করুন..." : "Ask about Earth..."}
                    defaultSuggestions={defaultSuggestions}
                    onImageUpload={handleImageUpload}
                    chatContext="earth"
                />
            </div>
        </div>
    );
};

export default EarthPage;