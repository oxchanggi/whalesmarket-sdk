# React Lib Demo

A modern React component library with TypeScript support.

## Installation

```bash
npm install whales-sdk
# or
yarn add whales-sdk
```

## Usage

```jsx
import { Button, Card, useToggle } from 'whales-sdk';

function App() {
  const [isOpen, toggle] = useToggle(false);

  return (
    <div>
      <Button onClick={toggle} variant="primary">
        {isOpen ? 'Hide' : 'Show'} Card
      </Button>
      
      {isOpen && (
        <Card 
          title="Example Card" 
          footer={<Button variant="outline">Footer Action</Button>}
        >
          This is an example of using the Card component with a Button in the footer.
        </Card>
      )}
    </div>
  );
}
```

## Components

### Button

A customizable button component.

```jsx
<Button 
  variant="primary" // 'primary', 'secondary', or 'outline'
  onClick={() => console.log('Clicked!')}
  disabled={false}
  className="custom-class"
>
  Click Me
</Button>
```

### Card

A card component for displaying content in a contained box.

```jsx
<Card 
  title="Card Title"
  footer={<div>Footer Content</div>}
  className="custom-class"
>
  Card content goes here
</Card>
```

## Hooks

### useToggle

A hook for toggle functionality.

```jsx
const [isVisible, toggle] = useToggle(false);

// Toggle the state
toggle();

// Use the state
{isVisible && <div>This content can be toggled</div>}
```

## Utils

The library also includes utility functions:

- `debounce`: Limit how often a function can be called
- `formatCurrency`: Format a number as currency
- `truncate`: Truncate a string if it exceeds a certain length

## Development

```bash
# Install dependencies
npm install

# Run Storybook for development
npm run storybook

# Build the library
npm run build

# Run tests
npm test
```

## License

MIT 

## Publish

```bash
./publish.sh skip-test skip-lint
```