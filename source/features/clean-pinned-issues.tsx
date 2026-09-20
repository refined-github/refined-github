/**
@description Changes the layout of pinned issues from side-by-side to a standard list.
@screenshot https://github-production-user-asset-6210df.s3.amazonaws.com/83146190/258224321-e8ee8c70-6952-4a42-8626-6b5f31d167a3.png
*/

import './clean-pinned-issues.css';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url);

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/eslint/eslint/issues

*/
