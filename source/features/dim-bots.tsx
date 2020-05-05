import './dim-bots.css';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	const bots = select.all([
		/* Commits */
		'.commit-author[href$="%5Bbot%5D"]:first-child',
		'.commit-author[href$="renovate-bot"]:first-child',

		/* Issues/PRs */
		'.opened-by [href*="author%3Aapp%2F"]'
	]);
	for (const bot of bots) {
		bot.closest('.commit, .Box-row')!.classList.add('rgh-dim-bot');
	}
}

features.add({
	id: __filebasename,
	description: 'Dims commits and PRs by bots to reduce noise.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/65263190-44c52b00-db36-11e9-9b33-d275d3c8479d.gif'
}, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isDiscussionList
	],
	init
});
