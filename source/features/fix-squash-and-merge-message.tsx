import select from 'select-dom';
import features from '../libs/features';

function init() {
	const button = select('.merge-message .btn-group-squash [type=submit]');
	if (!button) {
		return false;
	}

	button.addEventListener('click', () => {
		const description = select('.comment-form-textarea[name=\'pull_request[body]\']').textContent;
		select('#merge_message_field').value = description;
	});
}

features.add({
	id: 'fix-squash-and-merge-message',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
