import React from "react";
import { useCount } from "../contexts/CountContext";

/**
 * Example component that uses the useCount hook to display and update count
 */
export const CounterExample: React.FC = () => {
  const { count, updateCount } = useCount();

  return (
    <div className="counter-example">
      <h2>Counter Example</h2>
      <p>Current count: {count}</p>
      <div className="counter-buttons">
        <button onClick={() => updateCount(count - 1)}>Decrease</button>
        <button onClick={() => updateCount(count + 1)}>Increase</button>
        <button onClick={() => updateCount(0)}>Reset</button>
      </div>
    </div>
  );
};
