import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const botSelectors = [
	/* Commits */
	'.commit-author[href$="%5Bbot%5D"]:first-child',
	'.commit-author[href$="renovate-bot"]:first-child',
	'.commit-author[href$="scala-steward"]:first-child',

	/* Issues/PRs */
	'.opened-by [href*="author%3Aapp%2F"]',
	'.labels [href$="label%3Abot"]'
];

function init(): void {
	for (const bot of select.all(botSelectors)) {
		// Exclude co-authored commits
		if (select.all('a', bot.parentElement!).length === 1) {
			bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isConversationList
	],
	init
});
