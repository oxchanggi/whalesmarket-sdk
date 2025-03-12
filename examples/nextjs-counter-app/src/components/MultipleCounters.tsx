"use client";

import { CountProvider } from "react-lib-demo";
import CounterDisplay from "./CounterDisplay";

const MultipleCounters = () => {
  return (
    <div>
      <p>
        Each counter below has its own independent state managed by separate
        CountProvider instances.
      </p>

      <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
        <div className="counter-container" style={{ flex: 1 }}>
          <h3>Counter A</h3>
          <CountProvider initialCount={10}>
            <CounterDisplay />
          </CountProvider>
        </div>

        <div className="counter-container" style={{ flex: 1 }}>
          <h3>Counter B</h3>
          <CountProvider initialCount={20}>
            <CounterDisplay />
          </CountProvider>
        </div>
      </div>
    </div>
  );
};

export default MultipleCounters;
