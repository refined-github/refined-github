import select from 'select-dom';

export default function () {
	const btn = select('.merge-message .btn-group-merge [type=submit]');
	if (!btn) {
		return;
	}
	btn.addEventListener('click', () => {
		// Fix merge commit title
		const title = select('.js-issue-title').textContent;
		const number = select('.gh-header-number').textContent;
		select('#merge_title_field').value = `${title.trim()} (${number})`;
		// Fix merge commit message
		const mergeMessage = select('.mt-0 .js-comment-body').textContent;
		select('#merge_message_field').value = `${mergeMessage.trim()}`;
	});
}