# Next.js Counter App Example

This is an example Next.js application demonstrating how to use the `react-lib-demo` library with its CountProvider and useCount hook.

## Features

- Basic counter example using CountProvider and useCount
- Multiple independent counters example
- Modern UI with responsive design

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. First, build the main library:

```bash
# From the root of the project
npm install
npm run build
```

2. Then, install the dependencies for this example:

```bash
# From the examples/nextjs-counter-app directory
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

This example demonstrates:

1. How to import and use the CountProvider from the library
2. How to use the useCount hook to access and update the count state
3. How to create multiple independent counters using separate CountProvider instances

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

MIT 