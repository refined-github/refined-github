# Contributing

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+sort%3Areactions-%2B1-desc), especially [the easy ones](https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+sort%3Areactions-%2B1-desc).

## Notions

- You will need to be familiar with [npm](https://docs.npmjs.com/getting-started/) and TypeScript to build this extension.
- The extension can be loaded into Chrome or Firefox manually ([See notes below](#loading-into-the-browser))
- [JSX](https://reactjs.org/docs/introducing-jsx.html) is used to create DOM elements.
- All the [latest DOM APIs](https://github.com/WebReflection/dom4#features) and JavaScript features are available because the extension only has to work in the latest Chrome and Firefox. 🎉
- Each JavaScript feature lives in its own file under [`source/features`](https://github.com/sindresorhus/refined-github/tree/master/source/features) and it's imported in [`source/refined-github.ts`](https://github.com/sindresorhus/refined-github/blob/master/source/refined-github.ts).
- Some GitHub pages are loaded via AJAX/PJAX, so some features use the special `onAjaxedPages` loader (see it as a custom "on DOM ready").
- See what a _feature_ [looks like](https://github.com/sindresorhus/refined-github/blob/master/source/features/user-profile-follower-badge.tsx).
- Follow [the styleguide](https://github.com/sindresorhus/refined-github/blob/master/readme.md#L100) that appears in the Readme's source to write readable descriptions.
- Refined GitHub tries to integrate as best as possible, so [GitHub's own styleguide](https://primer.style/css) might come in useful.

## `features.add`

The simplest usage of `feature.add` is the following. This will be run instantly on all page-loads (but not on ajax loads):

```js
import features from '../libs/features';

function init () {
	console.log('✨');
}

features.add({
	id: __featureName__,
	description: 'Simplify the GitHub interface and adds useful features',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58238638-3cbcd080-7d7a-11e9-80f6-be6c0520cfed.jpg',
}, {
	load: features.nowAndOnAjaxedPages,
	init
});
```

Here's an example using all of the possible `feature.add` options:


```ts
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';

let subscription: delegate.DelegateSubscription | undefined;
function log() {
	console.log('✨', <div className="rgh-jsx-element"/>);
}
function init(): void {
	// Events must be set via delegate, unless shortlived
	subscription = delegate('.btn', 'click', log);
}
function deinit(): void {
	subscription?.destroy();
	subscription = undefined;
}

features.add({
	id: __featureName__,
	description: 'Simplify the GitHub interface and adds useful features',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58238638-3cbcd080-7d7a-11e9-80f6-be6c0520cfed.jpg',
	shortcuts: { // This only adds the shortcut to the help screen, it doesn't enable it
		'↑': 'Edit your last comment'
	},
}, {
	include: [
		features.isUserProfile,
		features.isRepo
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onDomReady, // Wait for DOM ready
	// load: features.onAjaxedPages, // Or: Wait for DOM ready AND run on all AJAXed loads
	// load: features.onNewComments, // Or: Wait for DOM ready AND run on all AJAXed loads AND watch for new comments
	deinit, // Rarely needed
	init
});
```


## Workflow

First clone:

```sh
git clone https://github.com/sindresorhus/refined-github
cd refined-github
npm install
```

When working on the extension or checking out branches, use this to have it constantly build your changes:

```sh
npm run watch # Listen for file changes and automatically rebuild
```

Then load or reload it into the browser to see the changes (this does not happen automatically).

## Loading into the browser

Once built, load it in the browser of your choice:

<table>
	<tr>
		<th>Chrome</th>
		<th>Firefox</th>
	</tr>
	<tr>
		<td width="50%" valign="top">
			<ol>
				<li>Open <code>chrome://extensions</code>;
				<li>Check the <strong>Developer mode</strong> checkbox;
				<li>Click on the <strong>Load unpacked extension</strong> button;
				<li>Select the folder <code>refined-github/distribution</code>.
			</ol>
		</td>
		<td width="50%" valign="top">
			<ol>
				<li>Open <code>about:debugging#addons</code>;
				<li>Click on the <strong>Load Temporary Add-on</strong> button;
				<li>Select the file <code>refined-github/distribution/manifest.json</code>.
			</ol>
			Or you can use run this command to have Firefox automatically load and reload it through <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/web-ext_command_reference#web-ext_run"><code>web-ext run</code></a>:</p>
			<pre>npm run watch:firefox</pre>
		</td>
	</tr>
</table>
