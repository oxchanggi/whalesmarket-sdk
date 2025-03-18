#!/bin/bash

# Build and publish packages

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building and publishing packages...${NC}"

# Build whales-core
echo -e "${GREEN}Building @whalesmarket/core...${NC}"
cd whales-core
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build @whalesmarket/core${NC}"
  exit 1
fi
echo -e "${GREEN}@whalesmarket/core built successfully${NC}"

# Build whales-sdk
echo -e "${GREEN}Building @whalesmarket/sdk...${NC}"
cd ../whales-sdk
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build @whalesmarket/sdk${NC}"
  exit 1
fi
echo -e "${GREEN}@whalesmarket/sdk built successfully${NC}"

# Build whales-mobile-sdk
echo -e "${GREEN}Building @whalesmarket/mobile-sdk...${NC}"
cd ../whales-mobile-sdk
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build @whalesmarket/mobile-sdk${NC}"
  exit 1
fi
echo -e "${GREEN}@whalesmarket/mobile-sdk built successfully${NC}"

# Publish packages
echo -e "${YELLOW}Do you want to publish the packages? (y/n)${NC}"
read -r publish

if [ "$publish" = "y" ]; then
  # Publish whales-core
  echo -e "${GREEN}Publishing @whalesmarket/core...${NC}"
  cd ../whales-core
  pnpm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish @whalesmarket/core${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whalesmarket/core published successfully${NC}"

  # Publish whales-sdk
  echo -e "${GREEN}Publishing @whalesmarket/sdk...${NC}"
  cd ../whales-sdk
  pnpm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish @whalesmarket/sdk${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whalesmarket/sdk published successfully${NC}"

  # Publish whales-mobile-sdk
  echo -e "${GREEN}Publishing @whalesmarket/mobile-sdk...${NC}"
  cd ../whales-mobile-sdk
  pnpm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish @whalesmarket/mobile-sdk${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whalesmarket/mobile-sdk published successfully${NC}"

  echo -e "${GREEN}All packages published successfully${NC}"
else
  echo -e "${YELLOW}Skipping publishing${NC}"
fi

echo -e "${GREEN}Done${NC}" 