"use client";

import { useCount } from "react-lib-demo";

const CounterDisplay = () => {
  const { count, updateCount } = useCount();

  return (
    <div>
      <p>Current count: {count}</p>
      <div className="counter-buttons">
        <button onClick={() => updateCount(count - 1)}>Decrease</button>
        <button onClick={() => updateCount(count + 1)}>Increase</button>
        <button onClick={() => updateCount(0)}>Reset</button>
      </div>
    </div>
  );
};

export default CounterDisplay;
