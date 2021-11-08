import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const commitSelector = [
	/* Commits */
	'.commit-author[href$="%5Bbot%5D"]',
	'.commit-author[href$="renovate-bot"]',
	'.commit-author[href$="scala-steward"]',
].join(',');

const prSelector = [
	/* Issues/PRs */
	'.opened-by [href*="author%3Aapp%2F"]',
	'.labels [href$="label%3Abot"]',
];

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
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isConversationList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
