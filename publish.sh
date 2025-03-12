#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        print_message "$1 ✅"
    else
        print_error "$2"
        exit 1
    fi
}

# Check if package.json exists
if [ ! -f package.json ]; then
    print_error "package.json not found in current directory!"
    exit 1
fi

# 1. Clean up previous builds
print_message "Cleaning up previous builds..."
rm -rf dist/
check_status "Cleanup completed" "Failed to clean up dist directory"

# 2. Install dependencies
print_message "Installing dependencies..."
pnpm install
check_status "Dependencies installed" "Failed to install dependencies"

# 3. Run tests if they exist
if grep -q "\"test\"" package.json; then
    print_message "Running tests..."
    pnpm test
    check_status "Tests completed" "Tests failed"
fi

# 4. Run linting if available
if grep -q "\"lint\"" package.json; then
    print_message "Running linting..."
    pnpm lint
    check_status "Linting completed" "Linting failed"
fi

# 5. Build the package
print_message "Building package..."
pnpm run build
check_status "Build completed" "Build failed"

# 6. Create a temporary directory and test npm pack
print_message "Testing npm pack..."
mkdir -p temp
npm pack --pack-destination temp
check_status "Package created successfully" "Failed to create package"

# 7. Ensure package.json has "files" field to only include dist
print_message "Checking package.json configuration..."
if ! grep -q "\"files\"" package.json || ! grep -q "\"dist\"" package.json; then
    print_warning "Adding or updating 'files' field in package.json to only publish dist folder"
    # Create a temporary file with updated package.json
    node -e "
        const pkg = require('./package.json');
        pkg.files = ['dist'];
        fs.writeFileSync('package.json.tmp', JSON.stringify(pkg, null, 2));
    "
    mv package.json.tmp package.json
    check_status "Updated package.json to only publish dist folder" "Failed to update package.json"
fi

# 8. Check if user is logged in to npm
print_message "Checking npm login status..."
npm whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    print_warning "You are not logged in to npm. Please log in:"
    npm login
    check_status "Login successful" "Failed to login to npm"
fi

# 9. Prompt for version update
echo
PACKAGE_NAME=$(node -p "require('./package.json').name")
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_message "Current version of $PACKAGE_NAME: $CURRENT_VERSION"
echo "Select version update type:"
echo "1) patch (1.0.0 -> 1.0.1)"
echo "2) minor (1.0.0 -> 1.1.0)"
echo "3) major (1.0.0 -> 2.0.0)"
echo "4) skip version update"
read -p "Enter choice [1-4]: " version_choice

case $version_choice in
    1) npm version patch ;;
    2) npm version minor ;;
    3) npm version major ;;
    4) print_message "Skipping version update" ;;
    *) print_error "Invalid choice" && exit 1 ;;
esac

# Add and commit version changes if version was updated
if [ $version_choice -ne 4 ]; then
    print_message "Adding and committing version changes..."
    git add package.json package-lock.json pnpm-lock.yaml
    git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
    check_status "Version changes committed" "Failed to commit version changes"
fi

# 10. Confirm before publishing
echo
print_warning "Ready to publish to npm. Please review the details above."
read -p "Do you want to continue? (y/N): " confirm
if [[ $confirm =~ ^[Yy]$ ]]; then
    # 11. Publish to npm
    print_message "Publishing package..."
    npm publish
    check_status "Package published successfully! 🎉" "Failed to publish package"
    
    # 12. Clean up temporary files
    print_message "Cleaning up..."
    rm -rf temp/
    check_status "Cleanup completed" "Failed to clean up temporary files"
else
    print_message "Publishing cancelled"
    rm -rf temp/
    exit 0
fi

# 13. Final success message
echo
UPDATED_VERSION=$(node -p "require('./package.json').version")
print_message "All tasks completed successfully! 🎉"
print_message "Package published to npm: $PACKAGE_NAME"
print_message "Current version: $UPDATED_VERSION" 