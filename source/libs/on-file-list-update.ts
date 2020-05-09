import select from 'select-dom';

export default function onFileListUpdate(callback: VoidFunction): void {
	// Selector copied from https://github.com/sindresorhus/hide-files-on-github
	const ajaxFiles = select('#files ~ include-fragment[src*="/file-list/"]');
	if (ajaxFiles) {
		new MutationObserver(callback).observe(ajaxFiles.parentNode!, {
			childList: true
		});
	}
}
