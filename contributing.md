# Contributing

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/refined-github/refined-github/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+sort%3Areactions-%2B1-desc), especially [the easy ones](https://github.com/refined-github/refined-github/issues?q=is%3Aissue+is%3Aopen+label%3A%22small%22+sort%3Areactions-%2B1-desc).

## Notions

- You will need to be familiar with [npm](https://docs.npmjs.com/getting-started/) and TypeScript to build this extension.
- The extension can be loaded into Chrome or Firefox manually ([See notes below](#loading-into-the-browser))
- [JSX](https://reactjs.org/docs/introducing-jsx.html) is used to create DOM elements.
- All the [latest DOM APIs](https://github.com/WebReflection/dom4#features) and JavaScript features are available because the extension only has to work in the latest Chrome and Firefox. 🎉
- Each JavaScript feature lives in its own file under [`source/features`](https://github.com/refined-github/refined-github/tree/main/source/features) and it's imported in [`source/refined-github.ts`](https://github.com/refined-github/refined-github/blob/main/source/refined-github.ts).
- See what a feature [looks like](https://github.com/refined-github/refined-github/blob/main/source/features/user-profile-follower-badge.tsx).
- Follow [the styleguide](https://github.com/refined-github/refined-github/blob/main/readme.md#L80) that appears in the Readme's source to write readable descriptions.
- Refined GitHub tries to integrate as best as possible, so [GitHub's own styleguide](https://primer.style/css) might come in useful.

## Create a new feature

You can start with a new feature by running:

```sh
npm run new -- your-feature-name
```

## `features.add`

The simplest usage of `feature.add` is the following. This will be run instantly on all page-loads:

```ts
import * as pageDetect from 'github-url-detection';
import features from '../feature-manager';

function init(): void {
	console.log('✨');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR, // Find which one you need on https://refined-github.github.io/github-url-detection/
	],
	awaitDomReady: true,
	init,
});
```

Here's an example using all of the possible `feature.add` options:

```tsx
import React from 'dom-chef';
import {$, $$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';

function append(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	event.delegateTarget.after('✨', <div className="rgh-jsx-element">Button clicked!</div>);
}

function init(signal: AbortSignal): void {
	// Events must be set via delegate, unless shortlived
	delegate('.btn', 'click', append, {signal});
}

void features.add(import.meta.url, {
	// This only adds the shortcut to the help screen, it doesn't enable it.
	shortcuts: {
		'↑': 'Edit your last comment'
	},

	// Whether to wait for DOM ready before running `init`. By default, it runs `init` as soon as `body` is found. @default false
	awaitDomReady: true,

	// Every one of these must match
	asLongAs: [
		pageDetect.isForkedRepo,
	],

	// At least one of these must match
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
		pageDetect.isEditingFile,
	],

	// None of these must match
	exclude: [
		pageDetect.isRepoRoot,
	],
	init,
}, {
	include: [
		pageDetect.isGist
	],
	init: () => console.log('Additional listener for gist pages!'),
});
```

## Workflow

First clone:

```sh
git clone https://github.com/refined-github/refined-github
cd refined-github
npm install
```

When working on the extension or checking out branches, use this to have it constantly build your changes:

```sh
npm run watch # Listen to file changes and automatically rebuild
```

Then load or reload it into the browser to see the changes.

## Loading into the browser

Once built, load it in the browser of your choice with [web-ext](https://github.com/mozilla/web-ext):

```sh
npx web-ext run --target=chromium # Open extension in Chrome
```

```sh
npx web-ext run # Open extension in Firefox
```

Or you can [load it manually in Chrome](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#google-chrome-opera-vivaldi) or [Firefox](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#mozilla-firefox).

## Reverse-engineering GitHub

GitHub fires several custom events that we can listen to. You can run this piece of code in the console to start seeing every event being fired:

```js
d = Node.prototype.dispatchEvent;
Node.prototype.dispatchEvent = function (...a) {
	console.log(...a);
	// debugger; // Uncomment when necessary
	d.apply(this, a);
};
```

<img width="379" alt="screen" src="https://user-images.githubusercontent.com/1402241/79168882-406ea100-7deb-11ea-9e9c-ad657202422f.png">
