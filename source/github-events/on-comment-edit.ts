import select from 'select-dom';

export default function onCommentEdit(callback: VoidFunction): void {
	for (const includeFragment of select.all('.js-comment-edit-form-deferred-include-fragment')) {
		includeFragment.addEventListener('loadend', callback);
	}
}
