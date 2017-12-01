import delegate from '../libs/smart-delegate';

// Prompt user to confirm erasing a comment with the Cancel button
export default function () {
	delegate('.js-hide-inline-comment-form', 'click', event => {
		// Do not prompt if textarea is empty
		const textarea = event.target.closest('.js-inline-comment-form').querySelector('.js-comment-field');
		if (textarea.value === '') {
			return;
		}

		if (window.confirm('Are you sure you want to discard your unsaved changes?') === false) { // eslint-disable-line no-alert
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	});
}
