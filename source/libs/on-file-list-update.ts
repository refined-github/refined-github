import select from 'select-dom';
import domLoaded from 'dom-loaded';

// Copied from https://github.com/sindresorhus/hide-files-on-github
export default async function (callback: VoidFunction) {
	await domLoaded;

	const observer = new MutationObserver(callback);
	const update = () => {
		callback();

		const ajaxFiles = select('include-fragment.file-wrap');
		if (ajaxFiles) {
			observer.observe(ajaxFiles.parentNode!, {
				childList: true
			});
		}
	};

	update();
	document.addEventListener('pjax:end', update);
}
