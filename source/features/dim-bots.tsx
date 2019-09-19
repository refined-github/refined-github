import './dim-bots.css';
import features from '../libs/features';
import select from 'select-dom';

async function init(): Promise<false | void> {
	const bots = select.all([
		'.commit-author[href$="%5Bbot%5D"]',
		'.commit-author[href$="renovate-bot"]',
	].join());
	for (const bot of bots) {
		bot.closest('.commit')!.classList.add('rgh-dim-bot');
	}
}

features.add({
	id: __featureName__,
	description: 'Dims commits by bots to reduce noise.',
	screenshot: '',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
