#!/bin/bash

# Setup script for the monorepo

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up the monorepo...${NC}"

# Make scripts executable
echo -e "${GREEN}Making scripts executable...${NC}"
chmod +x install-deps.sh
chmod +x build-and-publish.sh

echo -e "${GREEN}Setup complete${NC}"
echo -e "${YELLOW}Run ./install-deps.sh to install dependencies${NC}"
echo -e "${YELLOW}Run ./build-and-publish.sh to build and publish packages${NC}" 