/**
@description Makes it easier to distinguish draft PR in lists.
@screenshot https://user-images.githubusercontent.com/1402241/218252438-062a1ab3-4437-436d-9140-87bee23aaefb.png
*/

import './emphasize-draft-pr-label.css';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url);

/*

Test URLs:

- https://github.com/refined-github/refined-github/pulls
- https://github.com/pulls

*/
