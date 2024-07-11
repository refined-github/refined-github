import './rgh-welcome-issue.css';
import {$$, elementExists} from 'select-dom';
import delegate from 'delegate-it';

import features from '../feature-manager.js';
import openOptions from '../helpers/open-options.js';

/**
@file This issue has specific hidden links to wrap the text and then this feature creates a visible link only when the extension is installed.

@example

```md
...in the [](#rgh-linkify-welcome-issue)extension’s options[](#rgh-linkify-welcome-issue) to...
```

This is done so that when editing that issue we're aware that something is up with that piece of text. Without these hidden links we might forget about this feature and break it.

*/
const issueUrl = 'https://github.com/refined-github/refined-github/issues/3543';
const placeholdersSelector = 'a[href="#rgh-linkify-welcome-issue"]';

function init(signal: AbortSignal): void {
	delegate(placeholdersSelector, 'click', openOptions, {signal});

	if (elementExists('.rgh-linkify-welcome-issue')) {
		return;
	}

	const [opening, closing] = $$(placeholdersSelector);
	closing.remove();

	// Move the wrapped text into the existing link
	opening.append(opening.nextSibling!);
	opening.classList.add('rgh-linkify-welcome-issue');
}

void features.add(import.meta.url, {
	include: [
		() => location.href.startsWith(issueUrl),
	],
	awaitDomReady: true, // Small page
	init,
});
