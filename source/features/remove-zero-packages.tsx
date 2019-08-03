import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

function init(): void {
	const packageElem: HTMLElement | null = select(`.numbers-summary a[href='/${getRepoURL()}/packages']`);
	if (packageElem && packageElem.innerText.trim().startsWith('0')) {
		const parentElem = packageElem.parentElement;
		if (parentElem) {
			parentElem.remove();
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Removing 0 package',
	screenshot: false,
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
