# Contributing

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+sort%3Areactions-%2B1-desc), especially [the easy ones](https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+sort%3Areactions-%2B1-desc).

## Notions

- You will need to be familiar with [npm](https://docs.npmjs.com/getting-started/) and [webpack](https://web-design-weekly.com/2014/09/24/diving-webpack/) to build this extension.
- The extension can be loaded into Chrome or Firefox manually ([See notes below](#loading-into-the-browser))
- [JSX](https://reactjs.org/docs/introducing-jsx.html) is used to create DOM elements.
- All the [latest DOM APIs](https://github.com/WebReflection/dom4#features) and JavaScript features are available because the extension only has to work in the latest Chrome and Firefox. 🎉
- Each JavaScript feature lives in its own file under [`source/features`](https://github.com/sindresorhus/refined-github/tree/master/source/features) and it's imported in [`source/content.js`](https://github.com/sindresorhus/refined-github/blob/master/source/content.js).
- Some GitHub pages are loaded via AJAX/PJAX, so some features use the special `onAjaxedPages` loader (see it as a custom "on DOM ready").
- See what a _feature_ [looks like](https://github.com/sindresorhus/refined-github/blob/master/source/features/user-profile-follower-badge.tsx).
- If you're making changes to the README, try to match the style of the content that's already there and when in doubt, take a look at [our little style guide](https://github.com/sindresorhus/refined-github/issues/1139).

## `features.add`

The simplest usage of `feature.add` is the following. This will be run instantly on all page-loads (but not on ajax loads):

```js
import features from '../libs/features';

function init () {
	console.log('✨');
}

features.add({
	id: 'make-github-more-refined',
	init
});
```

Here's an example using all of the possible `feature.add` options:


```js
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function log() {
	console.log('✨', <div class="rgh-jsx-element"/>);
}
function init() {
	select('.btn').addEventListener('click', log);
}
function deinit() {
	select('.btn').removeEventListener('load', log);
}

features.add({
	id: 'make-github-more-refined',
	include: [
		features.isUserProfile,
		features.isOrganization
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.domReady, // Wait for dom-ready
	// load: features.onAjaxedPages, // Or: Wait for dom-ready AND run on all ajaxed loads
	// load: features.onNewComments, // Or: Wait for dom-ready AND run on all ajaxed loads AND watch for new comments
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
		<td width="50%">
			<ol>
				<li>Open <code>chrome://extensions</code>;
				<li>Check the <strong>Developer mode</strong> checkbox;
				<li>Click on the <strong>Load unpacked extension</strong> button;
				<li>Select the folder <code>refined-github/distribution</code>.
			</ol>
		</td>
		<td width="50%">
			<ol>
				<li>Open <code>about:debugging#addons</code>;
				<li>Click on the <strong>Load Temporary Add-on</strong> button;
				<li>Select the file <code>refined-github/distribution/manifest.json</code>.
			</ol>
		</td>
	</tr>
</table>

Firefox offers a more advanced loading technique that includes auto-reloading in the browser as well. Check-out [`web-ext run`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/web-ext_command_reference#web-ext_run).
