
import type { ChatMessage } from '../types';

interface ChatState {
  earthMessages: ChatMessage[];
  marsMessages: ChatMessage[];
}

// A simple listener function type.
type Listener = () => void;

// The listeners array will hold all the callback functions from components that are subscribed to the store.
const listeners = new Set<Listener>();

const chatStore: ChatState = {
  earthMessages: [
    {
      role: 'model',
      parts: [{ text: "Welcome to the Earth Explorer! Attempting to find your location..." }],
    },
  ],
  marsMessages: [
    {
      role: 'model',
      parts: [{ text: "Greetings! I am the Mars Exploration AI. Ask me anything about the Red Planet." }]
    }
  ],
};

// A function that components will call to get the current state and subscribe to changes.
export const useChatStore = () => {
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    // Return an unsubscribe function.
    // FIX: Wrap listeners.delete in braces to ensure the function returns void.
    // Set.delete() returns a boolean, which is not a valid useEffect cleanup return type.
    return () => { listeners.delete(listener); };
  };

  const getSnapshot = () => {
    return chatStore;
  };
  
  // This is a simplified version of what a hook like useSyncExternalStore does.
  // We're returning the functions so the component can manage its own state and subscription.
  return { subscribe, getSnapshot };
};

// Function to notify all subscribed components that the state has changed.
const notifyListeners = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const addEarthMessage = (message: ChatMessage) => {
  chatStore.earthMessages.push(message);
  notifyListeners();
};

export const setEarthMessages = (messages: ChatMessage[]) => {
  chatStore.earthMessages = messages;
  notifyListeners();
}

export const addMarsMessage = (message: ChatMessage) => {
  chatStore.marsMessages.push(message);
  notifyListeners();
};

export const setMarsMessages = (messages: ChatMessage[]) => {
  chatStore.marsMessages = messages;
  notifyListeners();
};
