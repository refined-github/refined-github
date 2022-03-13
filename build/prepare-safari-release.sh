#! /bin/bash

# Automatically exit on error
set -e

CONFIG_FILE=./safari/LocalOverrides.xcconfig

TAG=$(git describe --tags --abbrev=0)
PROJECT_VERSION=$(sed -n 's/^CURRENT_PROJECT_VERSION = \(.*\)/\1/p' < $CONFIG_FILE)
NEXT_PROJECT_VERSION=$((PROJECT_VERSION + 1))

echo "Will bump the project version" "$PROJECT_VERSION"

trash distribution
npm run build
npx dot-json distribution/manifest.json version "$TAG"

sed -i '' '/MARKETING_VERSION/d' $CONFIG_FILE
sed -i '' '/CURRENT_PROJECT_VERSION/d' $CONFIG_FILE

echo "MARKETING_VERSION = $TAG" >> $CONFIG_FILE
echo "CURRENT_PROJECT_VERSION = $NEXT_PROJECT_VERSION" >> $CONFIG_FILE
