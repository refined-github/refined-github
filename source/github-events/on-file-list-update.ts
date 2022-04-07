import select from 'select-dom';

export default function onFileListUpdate(callback: VoidFunction): void | Deinit {
	// Selector copied from https://github.com/sindresorhus/hide-files-on-github
	const ajaxFiles = select('#files ~ include-fragment[src*="/file-list/"]');
	if (ajaxFiles) {
		const observer = new MutationObserver(callback);
		observer.observe(ajaxFiles.parentNode!, {
			childList: true,
		});

		return observer;
	}
}
