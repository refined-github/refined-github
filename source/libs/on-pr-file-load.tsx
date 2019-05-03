import select from 'select-dom';
import domLoaded from 'dom-loaded';

export default async function (callback: VoidFunction): Promise<void> {
	await domLoaded;

	for (const fragment of select.all('include-fragment.diff-progressive-loader')) {
		fragment.addEventListener('load', callback);
	}

	callback();
}
