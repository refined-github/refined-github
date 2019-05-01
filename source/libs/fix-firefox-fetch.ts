const _fetch = window.fetch;

window.fetch = (url: string, ...args) => {
	const urlObject = new URL(url, location.origin);
	return _fetch(String(urlObject), ...args);
};
