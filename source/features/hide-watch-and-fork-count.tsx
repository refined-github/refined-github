import features from '../libs/features';
import select from 'select-dom';

function init() {
	for (const btn of select.all('.social-count[href$="/network/members"], .social-count[href$="/watchers"]')) {
		btn.classList.add('rgh-hide-watch-and-fork-count');
	}
}

features.add({
	id: 'hide-watch-and-fork-count',
	init
});
