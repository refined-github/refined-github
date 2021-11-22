import delegate from 'delegate-it';

function callbackWrapper(callback: VoidFunction): (event: CustomEvent) => void {
	return function (event) {
		if (/^pull request #\d+ updated$/.test(event.detail.data.reason)) {
			callback();
		}
	};
}

export default function onNewReviewComment(callback: VoidFunction): void {
	delegate(document, '.js-pull-refresh-on-pjax', 'socket:message', callbackWrapper(callback), {capture: true});
}
