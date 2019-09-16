export default async function postForm(form: HTMLFormElement): Promise<Response> {
	// `content.fetch` is Firefox’s way to make fetches from the page instead of from a different context
	// This will set the correct `origin` header without having to use XMLHttpRequest
	// https://stackoverflow.com/questions/47356375/firefox-fetch-api-how-to-omit-the-origin-header-in-the-request
	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
	const contentFetch = typeof window.content === 'object' ? window.content.fetch : window.fetch;

	const response = await contentFetch(form.action, {
		// TODO: drop `as` after https://github.com/microsoft/TSJS-lib-generator/issues/741
		body: new URLSearchParams(new FormData(form) as URLSearchParams),
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	return response;
}
