import './monospace-textareas.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(__filebasename, [pageDetect.hasRichTextEditor], 'has-rgh-inner');
