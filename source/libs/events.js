import select from 'select-dom';

export function onDeferredComments(cb) {
	for (const loadMore of select.all('.js-ajax-pagination:not(.rgh-deferred-comments)')) {
		loadMore.classList.add('rgh-deferred-comments');
		loadMore.addEventListener('page:loaded', () => {
			cb();
			onDeferredComments(cb);
		});
	}
}

