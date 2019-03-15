import select from 'select-dom';
import delegate from 'delegate-it';
import indentTextarea from 'indent-textarea';
import features from '../libs/features';

// Element.blur() will reset the tab focus to the start of the document.
// This places it back next to the blurred field
function blurAccessibly(field) {
	field.blur();

	const range = new Range();
	const selection = getSelection();
	const focusHolder = new Text();
	field.after(focusHolder);
	range.selectNodeContents(focusHolder);
	selection.removeAllRanges();
	selection.addRange(range);
	focusHolder.remove();
}

function init() {
	delegate('.js-comment-field, #commit-description-textarea', 'keydown', event => {
		const field: HTMLTextAreaElement = event.delegateTarget;

		// Don't do anything if the suggester box is active
		if (select.exists('.suggester:not([hidden])', field.form)) {
			return;
		}

		if (event.key === 'Tab' && !event.shiftKey) {
			indentTextarea(field);
			event.preventDefault();
		} else if (event.key === 'Escape') {
			// Cancel buttons have different classes for inline comments and editable comments
			const cancelButton = select<HTMLButtonElement>(`
				.js-hide-inline-comment-form,
				.js-comment-cancel-button
			`, field.form);

			// Cancel if there is a button, else blur the field
			if (cancelButton) {
				cancelButton.click();
			} else {
				blurAccessibly(field);
			}

			event.stopImmediatePropagation();
			event.preventDefault();
		} else if (event.key === 'ArrowUp' && field.value === '') {
			const currentConversationContainer = field.closest([
				'.js-inline-comments-container', // Current review thread container
				'.discussion-timeline' // Or just ALL the comments
			].join());
			const lastOwnComment = select
				.all<HTMLDetailsElement>('.js-comment.current-user', currentConversationContainer)
				.reverse()
				.find(comment => {
					const collapsible = comment.closest('details');
					return !collapsible || collapsible.open;
				});

			if (lastOwnComment) {
				select<HTMLButtonElement>('.js-comment-edit-button', lastOwnComment).click();
				const closeCurrentField = field
					.closest('form')
					.querySelector<HTMLButtonElement>('.js-hide-inline-comment-form');

				if (closeCurrentField) {
					closeCurrentField.click();
				}

				// Move caret to end of field
				requestAnimationFrame(() => {
					select<HTMLTextAreaElement>('.js-comment-field', lastOwnComment).selectionStart = Number.MAX_SAFE_INTEGER;
				});
			}
		}
	});
}

features.add({
	id: 'comment-fields-keyboard-shortcuts',
	shortcuts: {
		'↑': 'Edit your last comment'
	},
	init
});
