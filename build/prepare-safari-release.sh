#! /bin/bash

# Automatically exit on error
set -e

CONFIG_FILE=./safari/LocalOverrides.xcconfig

TAG=$(git describe --tags --abbrev=0)

if [[ $(git describe --tags) != "$TAG" ]]; then
	if [[ $(git status --porcelain) ]]; then
		echo You’re ahead of the latest tag. Run:
		echo git checkout "$TAG"
		echo
		echo "Proceed anyway? Press any key to continue..."
		read -n 1 -s
	fi

	git checkout "$TAG"
fi

PROJECT_VERSION=$(sed -n 's/^CURRENT_PROJECT_VERSION = \(.*\)/\1/p' < $CONFIG_FILE)
NEXT_PROJECT_VERSION=$((PROJECT_VERSION + 1))

echo "Will bump the project version" "$PROJECT_VERSION"

trash distribution
npm run build
# Quoted to ensure it's treated as a string, not a number, by dot-json
npx dot-json distribution/manifest.json version '"'$TAG'"' --json

# For https://github.com/refined-github/refined-github/issues/7629
# TODO: Drop after https://bugs.webkit.org/show_bug.cgi?id=277588
npx dot-json distribution/manifest.json background.service_worker --delete
npx dot-json distribution/manifest.json background.persistent false --json-value

# Due to https://github.com/refined-github/refined-github/issues/8405
npx dot-json distribution/manifest.json optional_host_permissions --delete

sed -i '' '/MARKETING_VERSION/d' $CONFIG_FILE
sed -i '' '/CURRENT_PROJECT_VERSION/d' $CONFIG_FILE

echo "MARKETING_VERSION = $TAG" >> $CONFIG_FILE
echo "CURRENT_PROJECT_VERSION = $NEXT_PROJECT_VERSION" >> $CONFIG_FILE
