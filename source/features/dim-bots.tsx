import './dim-bots.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const commitSelectors = [
	'actions-user',
	'bors',
	'ImgBotApp',
	'Octomerger',
	'renovate-bot',
	'rust-highfive',
	'rust-lang',
	'scala-steward',
	'snyk-bot',
	'web-flow',
].map(bot => `.commit-author[href$="?author=${bot}"]`);

commitSelectors.push('.commit-author[href$="%5Bbot%5D"]'); // Generic [bot] label

const commitSelector = commitSelectors.join(',');

const prSelector = [
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

	// Delay collapsing, but only after they're collapsed on load #5158
	requestAnimationFrame(() => {
		document.documentElement.classList.add('rgh-dim-bots--after-hover');
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isConversationList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
