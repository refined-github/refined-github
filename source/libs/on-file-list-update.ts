import select from 'select-dom';

// Copied from https://github.com/sindresorhus/hide-files-on-github
export default function (callback: VoidFunction): void {
	const ajaxFiles = select('#files ~ include-fragment[src*="/file-list/"]');
	if (ajaxFiles) {
		new MutationObserver(callback).observe(ajaxFiles.parentNode!, {
			childList: true
		});
	}
}
