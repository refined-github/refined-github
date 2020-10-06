import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

// eslint-disable-next-line import/prefer-default-export
export const botSelectors = [
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
		bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
	}
}

void features.add({
	id: __filebasename,
	description: 'Dims commits and PRs by bots to reduce noise.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/65263190-44c52b00-db36-11e9-9b33-d275d3c8479d.gif'
}, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isConversationList
	],
	init
});
