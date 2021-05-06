import './dim-bots.css';
import select from 'select-dom';
import oneMutation from 'one-mutation';
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

function tagsLoaded(): boolean {
	return select.exists('.js-navigation-container .octicon-tag');
}

async function init(): Promise<void> {
	for (const bot of select.all(botSelector)) {
		// Exclude co-authored commits
		if (select.all('a', bot.parentElement!).every(link => link.matches(botSelector))) {
			bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
		}
	}

	if (!tagsLoaded()) {
		await oneMutation(document.body, {subtree: true, childList: true, filter: tagsLoaded});
	}

	for (const tag of select.all('.js-navigation-container .octicon-tag')) {
		tag.closest('.commit, .Box-row')!.classList.remove('rgh-dim-bot');
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isConversationList
	],
	init
});
