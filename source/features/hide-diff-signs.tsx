import './hide-diff-signs.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(__filebasename, [pageDetect.hasCode], 'has-rgh-inner');
