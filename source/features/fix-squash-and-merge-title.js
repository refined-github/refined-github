import select from 'select-dom';

export default function () {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}
	btn.addEventListener('click', () => {
		const title = select('.js-issue-title').textContent;
		const number = select('.gh-header-number').textContent;
		select('#merge_title_field').value = `${title.trim()} (${number})`;
	});
}
