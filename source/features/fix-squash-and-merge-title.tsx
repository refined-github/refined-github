import select from 'select-dom';
import features from '../libs/features';

function init() {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return false;
	}

	btn.addEventListener('click', () => {
		const title = select('.js-issue-title').textContent;
		const number = select('.gh-header-number').textContent;
		select('#merge_title_field').value = `${title.trim()} (${number})`;
	});
}

features.add({
	id: 'fix-squash-and-merge-title',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
