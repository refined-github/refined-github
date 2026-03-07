import {isWebPage} from 'webext-detect';
import {messageRuntime} from 'webext-msg';

type FetchTextPayload = {
	url: string;
	options: RequestInit;
};

export async function fetchText({url, options}: FetchTextPayload): Promise<string> {
	const response = await fetch(url, options);
	return response.ok
		? response.text()
		: ''; // Likely a 404. Either way the response isn't the CSS we expect #8142
}

export async function isomorphicFetchText(url: string, options: RequestInit): Promise<string> {
	return isWebPage()
		// Firefox CSP issue: https://github.com/refined-github/refined-github/issues/8144
		? messageRuntime({fetchText: {url, options}})
		: fetchText({url, options});
}
