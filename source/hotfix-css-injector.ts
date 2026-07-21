// Injected by registerContentScripts when style hotfixes are available.
// Reads cached CSS from storage and injects it before the page renders.
const key = 'cache:style-hotfixes:';
void chrome.storage.local.get(key).then(result => {
	const css = (result[key] as {data: string} | undefined)?.data;
	if (css) {
		document.body.prepend(Object.assign(document.createElement('style'), {textContent: css}));
	}
});
