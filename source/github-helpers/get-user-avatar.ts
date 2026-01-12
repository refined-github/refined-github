import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

export default function getUserAvatar(username: string, size: number): string | void {
	let cleanName = username.replace('[bot]', '').toLowerCase();

	if (/[^\w-]/.test(cleanName)) {
		throw new TypeError(`Expected a username, got ${cleanName}`);
	}

	// Find image on page. Saves a request and a redirect
	const existingAvatar = $optional(`[href="/${cleanName}" i] img`);
	if (existingAvatar) {
		return existingAvatar.src;
	}

	if (cleanName === 'copilot') {
		cleanName = 'in/1143301';
	}

	const url = pageDetect.isEnterprise()
		? `/${cleanName}.png`
		: `https://avatars.githubusercontent.com/${cleanName}`;
		// Why use a 2x size: https://github.com/refined-github/refined-github/pull/4973#discussion_r735133613
	return url + `?size=${size * 2}`;
}
