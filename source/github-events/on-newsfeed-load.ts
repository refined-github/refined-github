import select from 'select-dom';

import {createFragmentLoadListener} from './on-fragment-load';

function onNewsfeedPageLoad(event: Event, callback: EventListener, signal: AbortSignal): void {
	select('.news .ajax-pagination-form[action^="/dashboard-feed"]')?.addEventListener('page:loaded', event => { // Older newsfeed events are paginated through a <form> element
		onNewsfeedPageLoad(event, callback, signal);
	}, {signal});

	callback(event);
}

export default function onNewsfeedLoad(callback: EventListener, signal: AbortSignal): void {
	createFragmentLoadListener('.news include-fragment[src="/dashboard-feed"]', event => {
		onNewsfeedPageLoad(event, callback, signal);
	}, signal);
}
