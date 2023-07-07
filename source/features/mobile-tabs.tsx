import './mobile-tabs.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

// TODO: Enable on profiles after the new header migration has completed. December 2023?
void features.addCssFeature(import.meta.url, [pageDetect.hasRepoHeader]);

/*

Test URLs:

https://github.com/refined-github/refined-github

*/
