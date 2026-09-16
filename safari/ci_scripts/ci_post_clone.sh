#!/bin/zsh

# Runs on Xcode Cloud after cloning. Builds the extension into `distribution/` (referenced by the Xcode project) and writes the gitignored xcconfig that the project needs.

set -euo pipefail

cd "$CI_PRIMARY_REPOSITORY_PATH"

brew install node

# Xcode Cloud makes a shallow clone without tags; the latest tag is the marketing version. The fallback handles a full clone (local testing).
git fetch --tags --unshallow --quiet 2>/dev/null || git fetch --tags --quiet
TAG=$(git describe --tags --abbrev=0)

npm ci
npm run build

# Same manifest patches as build/prepare-safari-release.sh
npx dot-json distribution/manifest.json version "\"$TAG\"" --json
# Due to https://github.com/refined-github/refined-github/issues/8405
npx dot-json distribution/manifest.json optional_host_permissions --delete

cat >| safari/LocalOverrides.xcconfig <<EOF
DEVELOPMENT_TEAM = YG56YK5RN5
MARKETING_VERSION = $TAG
CURRENT_PROJECT_VERSION = $CI_BUILD_NUMBER
EOF
