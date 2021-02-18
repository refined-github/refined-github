import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const botSelector = [
	/* Commits */
	'.commit-author[href$="%5Bbot%5D"]',
	'.commit-author[href$="renovate-bot"]',
	'.commit-author[href$="scala-steward"]',

	/* Issues/PRs */
	'.opened-by [href*="author%3Aapp%2F"]',
	'.labels [href$="label%3Abot"]'
].join();

function init(): void {
	for (const bot of select.all(botSelector)) {
		// Exclude co-authored commits
		if (select.all('a', bot.parentElement!).every(link => link.matches(botSelector))) {
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
