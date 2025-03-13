#!/bin/bash

# Build the main project
echo "Building the main project..."
pnpm run build

# Navigate to the example app directory
echo "Navigating to the example app directory..."
cd examples/nextjs

# Install dependencies
echo "Installing dependencies..."
pnpm install whales-sdk --force

# Start the development server
echo "Starting the development server..."
pnpm dev
