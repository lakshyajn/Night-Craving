'use client';
import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback 
} from 'react';

// Explicitly define the context type
const SyncContext = createContext({
  syncTrigger: 0,
  triggerSync: () => {}
});

export const SyncProvider = ({ children }) => {
  const [syncTrigger, setSyncTrigger] = useState(0);

  // Use useCallback to memoize the function
  const triggerSync = useCallback(() => {
    setSyncTrigger(prev => prev + 1);
  }, []);

  // Provide the full context value
  const contextValue = {
    syncTrigger,
    triggerSync
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
};

// Explicitly typed useSync hook
export const useSync = () => {
  const context = useContext(SyncContext);
  
  // Add a runtime check to ensure the context is used within a provider
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  
  return context;
};