#!/bin/bash

# Install dependencies for all packages

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing dependencies for all packages...${NC}"

# Install root dependencies
echo -e "${GREEN}Installing root dependencies...${NC}"
pnpm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install root dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}Root dependencies installed successfully${NC}"

# Install whales-core dependencies
echo -e "${GREEN}Installing @whales/core dependencies...${NC}"
cd whales-core
pnpm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install @whales/core dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}@whales/core dependencies installed successfully${NC}"

# Install whales-sdk dependencies
echo -e "${GREEN}Installing whales-sdk dependencies...${NC}"
cd ../whales-sdk
pnpm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install whales-sdk dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}whales-sdk dependencies installed successfully${NC}"

# Install whales-mobile-sdk dependencies
echo -e "${GREEN}Installing whales-mobile-sdk dependencies...${NC}"
cd ../whales-mobile-sdk
pnpm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install whales-mobile-sdk dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}whales-mobile-sdk dependencies installed successfully${NC}"

echo -e "${GREEN}All dependencies installed successfully${NC}" 