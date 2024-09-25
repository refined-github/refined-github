import './mobile-tabs.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

// TODO: Enable on profiles
// https://github.com/refined-github/refined-github/issues/7743
void features.addCssFeature(import.meta.url, [pageDetect.hasRepoHeader]);

/*

Test URLs:

https://github.com/refined-github/refined-github

*/
