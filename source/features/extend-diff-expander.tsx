import './extend-diff-expander.css';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function expandDiff(event: DelegateEvent): void {
	// Skip if the user clicked directly on the icon
	if (!(event.target as Element).closest('.js-expand')!) {
		select<HTMLAnchorElement>('.js-expand', event.delegateTarget)!.click();
	}
}

function init(): void {
	delegate('.diff-view', '.js-expandable-line', 'click', expandDiff);
}

features.add({
	id: __featureName__,
	description: 'Widens the `Expand diff` button to be clickable across the screen.',
	screenshot: 'https://user-images.githubusercontent.com/6978877/34470024-eee4f43e-ef20-11e7-9036-65094bd58960.PNG',
	include: [
		features.isPRFiles,
		features.isCommit
	],
	load: features.onAjaxedPages,
	init
});
