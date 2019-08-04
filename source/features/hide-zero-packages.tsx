import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

function init(): void {
	const packageElem: HTMLElement | null = select(`.numbers-summary a[href='/${getRepoURL()}/packages']`);
	if (packageElem && packageElem.textContent!.trim().startsWith('0')) {
		packageElem.parentElement!.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Hides the `Packages` tab in repositories if it’s empty.',
	screenshot: 'https://user-images.githubusercontent.com/35382021/62420784-a6652f00-b687-11e9-82a5-eaf6a636f218.png',
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init
});
