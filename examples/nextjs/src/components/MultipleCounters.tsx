"use client";

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
        </div>

        <div className="counter-container" style={{ flex: 1 }}>
          <h3>Counter B</h3>
        </div>
      </div>
    </div>
  );
};

export default MultipleCounters;
