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
];

const commitSelectors = botNames.map(bot => `.commit-author[href$="?author=${bot}"]`);
commitSelectors.push('.commit-author[href$="%5Bbot%5D"]'); // Generic `[bot]` label in author name
const commitSelector = commitSelectors.join(',');

const prSelectors = botNames.map(bot => `.opened-by [title*="pull requests created by ${bot}"]`);
prSelectors.push(
	'.opened-by [href*="author%3Aapp%2F"]', // Search query `is:pr+author:app/*`
	'.labels [href$="label%3Abot"]', // PR tagged with `bot` label
);
const prSelector = prSelectors.join(',');

function init(): void {
	for (const bot of select.all(commitSelector)) {
		// Exclude co-authored commits
		if (select.all('a', bot.parentElement!).every(link => link.matches(commitSelector))) {
			bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
		}
	}

	for (const bot of select.all(prSelector)) {
		bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
	}

	// Delay collapsing, but only after they're collapsed on load #5158
	requestAnimationFrame(() => {
		select(':is(#repo-content-pjax-container, turbo-frame) .js-navigation-container')!.classList.add('rgh-dim-bots--after-hover');
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
	deduplicate: 'has-rgh-inner',
	init,
});
