import {isWebPage} from 'webext-detect';
import {messageRuntime} from 'webext-msg';

export async function fetchText(url: string, options: RequestInit): Promise<string> {
	const response = await fetch(url, options);
	return response.ok
		? response.text()
		: ''; // Likely a 404. Either way the response isn't the CSS we expect #8142
}

export async function isomorphicFetchText(url: string, options: RequestInit): Promise<string> {
	return isWebPage()
		? messageRuntime({fetchString: {url, options}})
		: fetchText(url, options);
}
