#!/bin/bash

# Build and publish packages

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building and publishing packages...${NC}"

# Build whales-core
echo -e "${GREEN}Building @whales/core...${NC}"
cd whales-core
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build @whales/core${NC}"
  exit 1
fi
echo -e "${GREEN}@whales/core built successfully${NC}"

# Build whales-sdk
echo -e "${GREEN}Building whales-sdk...${NC}"
cd ../whales-sdk
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build whales-sdk${NC}"
  exit 1
fi
echo -e "${GREEN}whales-sdk built successfully${NC}"

# Build whales-mobile-sdk
echo -e "${GREEN}Building whales-mobile-sdk...${NC}"
cd ../whales-mobile-sdk
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build whales-mobile-sdk${NC}"
  exit 1
fi
echo -e "${GREEN}whales-mobile-sdk built successfully${NC}"

# Publish packages
echo -e "${YELLOW}Do you want to publish the packages? (y/n)${NC}"
read -r publish

if [ "$publish" = "y" ]; then
  # Publish whales-core
  echo -e "${GREEN}Publishing @whales/core...${NC}"
  cd ../whales-core
  pnpm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish @whales/core${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whales/core published successfully${NC}"

  # Publish whales-sdk
  echo -e "${GREEN}Publishing whales-sdk...${NC}"
  cd ../whales-sdk
  pnpm publish
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish whales-sdk${NC}"
    exit 1
  fi
  echo -e "${GREEN}whales-sdk published successfully${NC}"

  # Publish whales-mobile-sdk
  echo -e "${GREEN}Publishing whales-mobile-sdk...${NC}"
  cd ../whales-mobile-sdk
  pnpm publish
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish whales-mobile-sdk${NC}"
    exit 1
  fi
  echo -e "${GREEN}whales-mobile-sdk published successfully${NC}"

  echo -e "${GREEN}All packages published successfully${NC}"
else
  echo -e "${YELLOW}Skipping publishing${NC}"
fi

echo -e "${GREEN}Done${NC}" 