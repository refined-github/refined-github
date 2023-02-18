import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

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

function init(): void {
	for (const bot of select.all(commitSelectors)) {
		// Exclude co-authored commits
		if (select.all('a', bot.parentElement!).every(link => link.matches(commitSelectors))) {
			bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
		}
	}

	for (const bot of select.all(prSelectors)) {
		bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
	}

	// Delay collapsing, but only after they're collapsed on load #5158
	requestAnimationFrame(() => {
		select('#repo-content-turbo-frame .js-navigation-container')!.classList.add('rgh-dim-bots--after-hover');
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isBlank, // Prevent error on empty lists #5544
	],
	awaitDomReady: true, // TODO: Feature needs a rewrite
	deduplicate: 'has-rgh-inner',
	init,
});
