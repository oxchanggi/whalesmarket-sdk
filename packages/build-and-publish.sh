#!/bin/bash

# Build and publish packages

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Prompt for package selection
echo -e "${YELLOW}Select packages to build and publish:${NC}"
echo "1) @whalesmarket/sdk only"
echo "2) @whalesmarket/mobile-sdk only" 
echo "3) All packages (core, sdk, mobile-sdk)"
read -r package_selection

# Validate package selection
if [[ ! "$package_selection" =~ ^[1-3]$ ]]; then
  echo -e "${RED}Invalid package selection. Exiting.${NC}"
  exit 1
fi

# Prompt for version bump type
echo -e "${YELLOW}Select version bump type:${NC}"
echo "1) patch (0.1.1 -> 0.1.2)"
echo "2) minor (0.1.1 -> 0.2.0)"
echo "3) major (0.1.1 -> 2.0.0)"
read -r version_type

# Validate input
if [[ ! "$version_type" =~ ^[1-3]$ ]]; then
  echo -e "${RED}Invalid version selection. Exiting.${NC}"
  exit 1
fi

# Map input to version bump type
case $version_type in
  1) bump_type="patch" ;;
  2) bump_type="minor" ;;
  3) bump_type="major" ;;
esac

# Always need to build core first for dependencies
echo -e "${YELLOW}Building and publishing selected packages...${NC}"

# Step 1: Update core version and build
echo -e "${GREEN}Step 1: Updating @whalesmarket/core version (${bump_type})...${NC}"
cd whales-core
current_version=$(node -p "require('./package.json').version")
pnpm version $bump_type
new_version=$(node -p "require('./package.json').version")
echo -e "${GREEN}Version updated: ${current_version} -> ${new_version}${NC}"

# Build core
echo -e "${GREEN}Building @whalesmarket/core...${NC}"
pnpm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build @whalesmarket/core${NC}"
  exit 1
fi
echo -e "${GREEN}@whalesmarket/core built successfully${NC}"

# Build and update SDK if selected
if [[ "$package_selection" == "1" || "$package_selection" == "3" ]]; then
  # Step 2: Update SDK version and dependencies
  echo -e "${GREEN}Step 2: Updating @whalesmarket/sdk version and dependencies...${NC}"

  # Update SDK
  cd ../whales-sdk
  echo -e "${GREEN}Updating @whalesmarket/sdk version (${bump_type})...${NC}"
  current_sdk_version=$(node -p "require('./package.json').version")
  pnpm version $bump_type
  new_sdk_version=$(node -p "require('./package.json').version")
  echo -e "${GREEN}SDK version updated: ${current_sdk_version} -> ${new_sdk_version}${NC}"

  # Update SDK dependencies
  echo -e "${GREEN}Updating @whalesmarket/sdk dependencies...${NC}"
  # Update publishConfig dependency on core
  node -e "
    const fs = require('fs');
    const pkg = require('./package.json');
    if (!pkg.publishConfig) pkg.publishConfig = {};
    if (!pkg.publishConfig.dependencies) pkg.publishConfig.dependencies = {};
    pkg.publishConfig.dependencies['@whalesmarket/core'] = '^${new_version}';
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  " 
  echo -e "${GREEN}Updated @whalesmarket/sdk to depend on @whalesmarket/core ^${new_version}${NC}"

  # Build SDK
  pnpm run build
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build @whalesmarket/sdk${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whalesmarket/sdk built successfully${NC}"
fi

# Build and update Mobile SDK if selected
if [[ "$package_selection" == "2" || "$package_selection" == "3" ]]; then
  # Step 3: Update Mobile SDK version and dependencies
  echo -e "${GREEN}Step 3: Updating @whalesmarket/mobile-sdk version and dependencies...${NC}"

  # Update Mobile SDK
  cd ../whales-mobile-sdk
  echo -e "${GREEN}Updating @whalesmarket/mobile-sdk version (${bump_type})...${NC}"
  current_mobile_sdk_version=$(node -p "require('./package.json').version")
  pnpm version $bump_type
  new_mobile_sdk_version=$(node -p "require('./package.json').version")
  echo -e "${GREEN}Mobile SDK version updated: ${current_mobile_sdk_version} -> ${new_mobile_sdk_version}${NC}"

  # Update dependencies
  echo -e "${GREEN}Updating @whalesmarket/mobile-sdk dependencies...${NC}"
  # Update publishConfig dependency on core
  node -e "
    const fs = require('fs');
    const pkg = require('./package.json');
    if (!pkg.publishConfig) pkg.publishConfig = {};
    if (!pkg.publishConfig.dependencies) pkg.publishConfig.dependencies = {};
    pkg.publishConfig.dependencies['@whalesmarket/core'] = '^${new_version}';
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  "
  echo -e "${GREEN}Updated @whalesmarket/mobile-sdk to depend on @whalesmarket/core ^${new_version}${NC}"

  # Build mobile SDK
  pnpm run build
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build @whalesmarket/mobile-sdk${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whalesmarket/mobile-sdk built successfully${NC}"
fi

# Step 4: Publish packages
echo -e "${YELLOW}Do you want to publish the packages? (y/n)${NC}"
read -r publish

if [ "$publish" = "y" ]; then
  echo -e "${GREEN}Step 4: Publishing selected packages...${NC}"
  
  # Always publish core first (needed for dependencies)
  echo -e "${GREEN}Publishing @whalesmarket/core v${new_version}...${NC}"
  cd ../whales-core
  pnpm publish --access public --no-git-checks
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish @whalesmarket/core${NC}"
    exit 1
  fi
  echo -e "${GREEN}@whalesmarket/core published successfully${NC}"

  # Then SDK if selected
  if [[ "$package_selection" == "1" || "$package_selection" == "3" ]]; then
    echo -e "${GREEN}Publishing @whalesmarket/sdk v${new_sdk_version}...${NC}"
    cd ../whales-sdk
    pnpm publish --access public --no-git-checks
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to publish @whalesmarket/sdk${NC}"
      exit 1
    fi
    echo -e "${GREEN}@whalesmarket/sdk published successfully${NC}"
  fi

  # Then mobile SDK if selected
  if [[ "$package_selection" == "2" || "$package_selection" == "3" ]]; then
    echo -e "${GREEN}Publishing @whalesmarket/mobile-sdk v${new_mobile_sdk_version}...${NC}"
    cd ../whales-mobile-sdk
    pnpm publish --access public --no-git-checks
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to publish @whalesmarket/mobile-sdk${NC}"
      exit 1
    fi
    echo -e "${GREEN}@whalesmarket/mobile-sdk published successfully${NC}"
  fi

  echo -e "${GREEN}All selected packages published successfully${NC}"
else
  echo -e "${YELLOW}Skipping publishing${NC}"
fi

echo -e "${GREEN}Done${NC}" 