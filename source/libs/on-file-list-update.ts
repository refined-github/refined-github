export default async function (callback: VoidFunction): Promise<void> {
	const ajaxFiles = document.querySelector('include-fragment.file-wrap');
	if (ajaxFiles) {
		new MutationObserver(callback).observe(ajaxFiles.parentNode!, {
			childList: true
		});
	}
}
