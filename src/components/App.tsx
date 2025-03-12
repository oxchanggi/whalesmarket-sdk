import React from "react";
import { CountProvider } from "../contexts/CountContext";
import { CounterExample } from "./CounterExample";

/**
 * Main App component that wraps children with CountProvider
 */
export const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Count Context Example</h1>
      <CountProvider initialCount={10}>
        <CounterExample />
      </CountProvider>
    </div>
  );
};
