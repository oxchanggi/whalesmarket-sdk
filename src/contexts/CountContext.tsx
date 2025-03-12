import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our context state
interface CountContextType {
  count: number;
  updateCount: (newCount: number) => void;
}

// Create context with a default value
const CountContext = createContext<CountContextType | undefined>(undefined);

// Props for our provider component
interface CountProviderProps {
  children: ReactNode;
  initialCount?: number;
}

/**
 * Provider component that wraps your app and makes count value available to any
 * child component that calls useCount().
 */
export const CountProvider: React.FC<CountProviderProps> = ({
  children,
  initialCount = 0,
}) => {
  const [count, setCount] = useState<number>(initialCount);

  // Function to update count
  const updateCount = (newCount: number) => {
    setCount(newCount);
  };

  // Value that will be provided to consumers of this context
  const value = {
    count,
    updateCount,
  };

  return (
    <CountContext.Provider value={value}>{children}</CountContext.Provider>
  );
};

/**
 * Custom hook to access the count context
 * This hook can be used by any component that needs access to the count state
 */
export const useCount = (): CountContextType => {
  const context = useContext(CountContext);

  if (context === undefined) {
    throw new Error("useCount must be used within a CountProvider");
  }

  return context;
};
