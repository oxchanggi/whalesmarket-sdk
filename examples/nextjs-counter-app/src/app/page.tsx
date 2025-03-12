"use client";

import { CountProvider } from "react-lib-demo";
import CounterDisplay from "@/components/CounterDisplay";
import MultipleCounters from "@/components/MultipleCounters";

export default function Home() {
  return (
    <div>
      <h1>Next.js Counter App Example</h1>
      <p>
        This is an example of using the CountProvider and useCount hook from
        react-lib-demo in a Next.js application.
      </p>

      {/* Basic counter example */}
      <div className="counter-container">
        <h2>Basic Counter</h2>
        <CountProvider initialCount={5}>
          <CounterDisplay />
        </CountProvider>
      </div>

      {/* Multiple counters example */}
      <div className="counter-container">
        <h2>Multiple Counters</h2>
        <MultipleCounters />
      </div>
    </div>
  );
}
