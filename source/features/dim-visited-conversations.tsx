import './dim-visited-conversations.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(import.meta.url, [pageDetect.isConversationList]);
