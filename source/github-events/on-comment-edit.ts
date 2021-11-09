import select from 'select-dom';

export default async function onCommentEdit(callback: VoidFunction): Promise<void> {
	for (const includeFragment of select.all('.js-comment-edit-form-deferred-include-fragment')) {
		includeFragment.addEventListener('loadend', callback);
	}
}
