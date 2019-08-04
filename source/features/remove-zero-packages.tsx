import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

function init(): void {
	const packageElem: HTMLElement | null = select(`.numbers-summary a[href='/${getRepoURL()}/packages']`);
	if (packageElem && packageElem.innerText.trim() === '0 packages') {
		packageElem.parentElement!.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Hides the `Packages` tab in repositories if it\'s empty.',
	screenshot: false,
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init
});
