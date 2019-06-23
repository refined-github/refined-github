import select from 'select-dom';
import delegate from 'delegate-it';
import indentTextarea from 'indent-textarea';
import insertText from 'insert-text-textarea';
import features from '../libs/features';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~'];

// Element.blur() will reset the tab focus to the start of the document.
// This places it back next to the blurred field
export function blurAccessibly(field: HTMLElement): void {
	field.blur();

	const range = new Range();
	const selection = getSelection()!;
	const focusHolder = new Text();
	field.after(focusHolder);
	range.selectNodeContents(focusHolder);
	selection.removeAllRanges();
	selection.addRange(range);
	focusHolder.remove();
}

function init(): void {
	delegate<HTMLTextAreaElement, KeyboardEvent>('.js-comment-field, #commit-description-textarea', 'keydown', event => {
		const field = event.delegateTarget;

		// Don't do anything if the suggester box is active
		if (select.exists('.suggester:not([hidden])', field.form!)) {
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
			`, field.form!);

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
				'.discussion-timeline', // Or just ALL the comments in issues
				'#all_commit_comments' // Single commit comments at the bottom
			].join())!;
			const lastOwnComment = select
				.all<HTMLDetailsElement>('.js-comment.current-user', currentConversationContainer)
				.reverse()
				.find(comment => {
					const collapsible = comment.closest('details');
					return !collapsible || collapsible.open;
				});

			if (lastOwnComment) {
				select<HTMLButtonElement>('.js-comment-edit-button', lastOwnComment)!.click();
				const closeCurrentField = field
					.closest('form')!
					.querySelector<HTMLButtonElement>('.js-hide-inline-comment-form');

				if (closeCurrentField) {
					closeCurrentField.click();
				}

				// Move caret to end of field
				requestAnimationFrame(() => {
					select<HTMLTextAreaElement>('.js-comment-field', lastOwnComment)!.selectionStart = Number.MAX_SAFE_INTEGER;
				});
			}
		} else if (formattingCharacters.includes(event.key)) {
			const [start, end] = [field.selectionStart, field.selectionEnd];

			// If `start` and `end` of selection are the same, then no text is selected
			if (start === end) {
				return;
			}

			event.preventDefault();

			const formattingChar = event.key;
			const selectedText = field.value.slice(start, end);
			const matchingEndChar = matchingCharacters[formattingCharacters.indexOf(formattingChar)];
			insertText(field, formattingChar + selectedText + matchingEndChar);

			// Keep the selection as it is, to be able to chain shortcuts
			field.setSelectionRange(start + 1, end + 1);
		}
	});
}

features.add({
	id: __featureName__,
	description: 'Quickly edit your last comment using the `↑` keyboard shortcut',
	shortcuts: {
		'↑': 'Edit your last comment'
	},
	init
});
