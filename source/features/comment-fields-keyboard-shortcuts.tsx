import select from 'select-dom';
import delegate, {DelegateEvent, DelegateEventHandler} from 'delegate-it';
import features from '../libs/features';
import blurAccessibly from '../libs/blur-field-accessibly';

export function listenToCommentFields(callback: DelegateEventHandler<KeyboardEvent, HTMLTextAreaElement>): void {
	delegate<HTMLTextAreaElement, KeyboardEvent>('.js-comment-field, #commit-description-textarea', 'keydown', event => {
		const field = event.delegateTarget;

		// Don't do anything if the autocomplete helper is shown or if non-Roman input is being used
		if (select.exists('.suggester', field.form!) || event.isComposing) {
			return;
		}

		callback(event);
	}, {
		// Adds support for `esc` key; GitHub seems to use `stopPropagation` on it
		capture: true
	});
}

function handler(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;

	if (event.key === 'Escape') {
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
	}
}

function init(): void {
	listenToCommentFields(handler);
}

features.add({
	id: __featureName__,
	description: 'Adds shortcuts to comment fields: `↑` to edit your previous comment; `esc` to blur field or cancel comment.',
	screenshot: false,
	shortcuts: {
		'↑': 'Edit your last comment',
		esc: 'Unfocuses comment field'
	},
	init
});
