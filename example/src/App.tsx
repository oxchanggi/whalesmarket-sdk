import React from "react";
import { Button, Card, useToggle } from "../../src";
import { formatCurrency, truncate } from "../../src/utils/helpers";

const App: React.FC = () => {
  const [showCard, toggleCard] = useToggle(false);
  const [theme, toggleTheme] = useToggle(false);

  const longText =
    "This is a very long text that will be truncated using our utility function. It demonstrates how to use the truncate utility from our library.";

  return (
    <div
      className={`p-8 min-h-screen ${
        theme ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">React Lib Demo</h1>
          <Button onClick={toggleTheme} variant="outline">
            Switch to {theme ? "Light" : "Dark"} Mode
          </Button>
        </div>

        <div className="grid gap-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Button Component</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="primary" disabled>
                Disabled Button
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Card Component</h2>
            <Button onClick={toggleCard}>
              {showCard ? "Hide" : "Show"} Card Example
            </Button>

            {showCard && (
              <Card
                title="Product Information"
                footer={
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{formatCurrency(99.99)}</span>
                    <Button variant="primary">Add to Cart</Button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <p>{truncate(longText, 100)}</p>
                  <p>Full text: {longText}</p>
                </div>
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Utility Functions</h2>
            <Card>
              <div className="space-y-2">
                <p>
                  <strong>formatCurrency:</strong> {formatCurrency(1234.56)}
                </p>
                <p>
                  <strong>truncate:</strong> {truncate(longText, 50)}
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
