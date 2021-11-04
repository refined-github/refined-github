# Hotfixes branch

The `hotfix.csv` file allows the maintainers of Refined GitHub to immediately disable features that unexpectedly wreak havoc for a reason or another, without having to wait for the browser to download a new update.

More information can be found on: https://github.com/sindresorhus/refined-github/issues/3529

## Adding a new broken feature

- Add the name of the feature on a new line: `name,unaffected version,related issue number`
- Ensure that there are exactly 2 commas on each line
- Ensure that there are no spaces on each line (PR welcome to trim each value instead)
- Ensure that the table is rendered on GitHub.com. If not, the CSV isn't valid
- Don't remove previous features unnecessarily, let's keep the file to about 10 lines

Example:

```diff
  ci-link,21.5.1,1234
  fit-textareas,21.5.1,2001
  link-to-file-in-file-history,21.5.1,4532
  avoid-accidental-submissions,21.5.9,5001
+ my-new-broken-feature,,5332
```

## Marking a feature as fixed

- Specify the version that contains the fixed feature on the same line
- Ensure that there are no trailing spaces

Example:

```diff
  ci-link,21.5.1,1234
  fit-textareas,21.5.1,2001
  link-to-file-in-file-history,21.5.1,4532
  avoid-accidental-submissions,21.5.9,5001
- my-new-broken-feature,,5332
+ my-new-broken-feature,21.6.9,5332
```

