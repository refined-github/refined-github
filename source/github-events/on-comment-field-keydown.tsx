import delegate from 'delegate-it';

export default function onCommentFieldKeydown(callback: delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement>): void {
	delegate<HTMLTextAreaElement, KeyboardEvent>(document, '.js-comment-field, #commit-description-textarea', 'keydown', event => {
		const field = event.delegateTarget;

		// Don't do anything if the autocomplete helper is shown or if non-latin input is being used
		if (field.form!.$.exists('.suggester') || event.isComposing) {
			return;
		}

		callback(event);
	}, {
		// Adds support for `esc` key; GitHub seems to use `stopPropagation` on it
		capture: true
	});
}
