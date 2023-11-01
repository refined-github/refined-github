import './dim-bots.css';
import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import preserveScroll from '../helpers/preserve-scroll.js';

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
		`.opened-by [title$="pull requests created by ${bot}"]`,
		`.opened-by [title$="pull requests opened by ${bot}"]`,
	]),
	'.opened-by [href*="author%3Aapp%2F"]', // Search query `is:pr+author:app/*`
	'.labels [href$="label%3Abot"]', // PR tagged with `bot` label
];

const dimBots = features.getIdentifiers(import.meta.url);

function undimBots(event: DelegateEvent): void {
	const target = event.target as HTMLElement;
	// Only undim when clicking on empty areas
	if (target.closest('a, button, input, [tabindex]')) {
		return;
	}

	const resetScroll = preserveScroll(target);
	for (const bot of $$(dimBots.selector)) {
		bot.classList.add('rgh-interacted');
	}

	resetScroll();
}

function init(signal: AbortSignal): void {
	for (const bot of $$(commitSelectors)) {
		// Exclude co-authored commits
		if ($$('a', bot.parentElement!).every(link => link.matches(commitSelectors))) {
			bot.closest('.commit, .Box-row')!.classList.add(dimBots.class);
		}
	}

	for (const bot of $$(prSelectors)) {
		bot.closest('.commit, .Box-row')!.classList.add(dimBots.class);
	}

	// Undim on mouse focus
	delegate(dimBots.selector, 'click', undimBots, {signal});
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
	init,
});

/*

Test URLs

- Commits: https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174
- PRs: https://github.com/OctoLinker/OctoLinker/pulls?q=is%3Apr+is%3Aclosed

*/
