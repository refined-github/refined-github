The `hotfix.json` file allows the maintainers of Refined GitHub to immediately disable features that unexpectedly wreak havoc for a reason or another, without having to wait for the browser to download a new update.

More information can be found on: https://github.com/sindresorhus/refined-github/issues/3529

## Please make sure it's valid JSON before committing

Here's some examples:

```json
{
  "feature:cleanup-repo-filelist-actions": false
}
```

If a feature was fixed by a recent release, don't immediately remove it, you can add a `unaffected` property with the version where the feature works:

```json
{
  "feature:cleanup-repo-filelist-actions": false,
  "unaffected": "20.9.4"
}
```

You can specify multiple features at once

```json
{
  "feature:close-out-of-view-modals": false,
  "feature:recently-pushed-branches-enhancements": false
}
```

But there's no way to mark only one feature as fixed via `unaffected`, so prefer keeping both features disabled for a little longer rather than dropping a hotfix too early.
