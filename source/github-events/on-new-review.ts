import mem from 'mem';
import debounce from 'debounce-fn';
import delegate from 'delegate-it';

const getDeduplicatedHandler = mem((callback: EventListener): delegate.EventHandler => debounce((event: delegate.Event) => {
	callback(event);
}, {wait: 200}));

export default function onNewReviewComment(callback: EventListener): void {
	delegate(document, '.js-pull-refresh-on-pjax', 'socket:message', getDeduplicatedHandler(callback), {capture: true});
}
