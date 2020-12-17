import './monospace-textareas.css';

import features from '.';
import cssOnlyFeature from '../helpers/css-only-feature';

void features.add(__filebasename, {
	awaitDomReady: false,
	init: () => void cssOnlyFeature(__filebasename)
});
