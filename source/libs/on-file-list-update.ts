let target = new EventTarget(); // Using a replaceable target is an easy way to discard all listeners at once
const observer = new MutationObserver(dispatch);

function dispatch(): void {
	target.dispatchEvent(new CustomEvent('rgh:file-list-update'));
}

function observe(): void {
	const ajaxFiles = document.querySelector('include-fragment.file-wrap');
	if (ajaxFiles) {
		observer.observe(ajaxFiles.parentNode!, {
			childList: true
		});
	}
}

function connect(): void {
	observe();
	target.addEventListener('rgh:file-list-update', observe);
}

function disconnect(): void {
	observer.disconnect();
	target = new EventTarget();
}

export default async function onFileListUpdate(callback: VoidFunction): Promise<void> {
	connect();
	document.addEventListener('pjax:end', disconnect);
	target.addEventListener('rgh:file-list-update', callback);
}
