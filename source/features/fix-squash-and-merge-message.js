import select from 'select-dom';

export default function () {
	const button = select('.merge-message .btn-group-squash [type=submit]');
	if (!button) {
		return;
	}

	button.addEventListener('click', () => {
		const description = select('.comment-form-textarea[name=\'pull_request[body]\']').textContent;
		select('#merge_message_field').value = description;
	});
}
