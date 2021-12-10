import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';

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

function openOptions(): void {
	void browser.runtime.sendMessage({openOptionsPage: true});
}

function init(): void {
	const [opening, closing] = select.all<HTMLAnchorElement>(placeholdersSelector);
	if (!closing) {
		// Already done
		return;
	}

	opening.append(opening.nextSibling!);
	closing.remove();
	delegate(document, placeholdersSelector, 'click', openOptions);
}

void features.add(import.meta.url, {
	include: [
		() => location.href.startsWith(issueUrl),
	],
	deduplicate: false,
	init,
});
