import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import features from '../feature-manager';

const botNames = [
	'actions-user',
	'bors',
	'ImgBotApp',
	'Octomerger',
	'renovate-bot',
	'rust-highfive',
	'scala-steward',
	'snyk-bot',
	'web-flow',
	'weblate',
] as const;

const commitSelectors = [
	...botNames.map(bot => `.commit-author[href$="?author=${bot}"]`),
	'.commit-author[href$="%5Bbot%5D"]', // Generic `[bot]` label in author name
];

const prSelectors = [
	...botNames.flatMap(bot => [
		`.opened-by [title*="pull requests created by ${bot}"]`,
		`.opened-by [title*="pull requests opened by ${bot}"]`,
	]),
	'.opened-by [href*="author%3Aapp%2F"]', // Search query `is:pr+author:app/*`
	'.labels [href$="label%3Abot"]', // PR tagged with `bot` label
];

const dimBots = features.getIdentifiers(import.meta.url);

function undimBots(): void {
	for (const bot of select.all(dimBots.selector)) {
		bot.classList.remove(dimBots.class);
	}
}

function init(signal: AbortSignal): void {
	for (const bot of select.all(commitSelectors)) {
		// Exclude co-authored commits
		if (select.all('a', bot.parentElement!).every(link => link.matches(commitSelectors))) {
			bot.closest('.commit, .Box-row')!.classList.add(dimBots.class);
		}
	}

	for (const bot of select.all(prSelectors)) {
		bot.closest('.commit, .Box-row')!.classList.add(dimBots.class);
	}

	// Undim on mouse focus
	delegate(document, dimBots.selector, 'click', undimBots, {signal});

	// Undim on keyboard focus
	document.documentElement.addEventListener('navigation:keydown', undimBots, {once: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isBlank, // Prevent error on empty lists #5544
	],
	awaitDomReady: true, // TODO: Rewrite with :has()
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs


https://github.com/typed-ember/ember-cli-typescript/commits/master
https://github.com/OctoLinker/OctoLinker/commits/master
https://github.com/OctoLinker/OctoLinker/pulls?q=is%3Apr+is%3Aclosed

*/
