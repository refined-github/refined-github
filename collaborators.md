# Collaborator guide

## Creating releases

Releases are done semi-automatically through GitHub Actions. See the full workflow: [release.yml](.github/workflows/release.yml)

On the first of every month, it attempts to create a release if there are any unreleased commits on the `main` branch.

To create a release manually, visit the [Release workflow page](https://github.com/refined-github/refined-github/actions/workflows/release.yml) and click “Run the workflow”. This can be done approximately once a week, if worth it, or earlier if there are bugs of medium severity.

## Hotfixes

When features are breaking GitHub altogether, they can be disabled immediately for everyone without going through the release/update process.

Refined GitHub fetches a list of buggy features at most every 6 hours if the user visits GitHub.

This list of disabled features lives on the [`yolo` repo](https://github.com/refined-github/yolo), together with more detailed instructions on how to properly use it.
