import './clean-rich-text-editor.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url, [pageDetect.hasRichTextEditor]);

/*

## Test URLs

On create issue page
One PR https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml

On an issue page
https://github.com/refined-github/refined-github/issues/6408

On discussion page
https://github.com/StrataSource/Portal-2-Community-Edition/discussions/706

*/
