import './mobile-tabs.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

// TODO: Enable on profiles
void features.addCssFeature(import.meta.url, [pageDetect.hasRepoHeader]);

/*

Test URLs:

https://github.com/refined-github/refined-github

*/
