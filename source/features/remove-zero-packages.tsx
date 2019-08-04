import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

function init(): void {
	const packageElem: HTMLElement | null = select(`.numbers-summary a[href='/${getRepoURL()}/packages']`);
	if (packageElem && packageElem.innerText.trim() === '0 packages') {
		const parentElem = packageElem.parentElement;
		parentElem!.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Hides the packages tab, when no packages exist',
	screenshot: false,
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
