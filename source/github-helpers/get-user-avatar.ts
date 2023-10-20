import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

export default function getUserAvatar(username: string, size: number): string | void {
	const cleanName = username.replace('[bot]', '');

	// Find image on page. Saves a request and a redirect + add support for bots
	const existingAvatar = $(`img[alt="@${cleanName}"]`);
	if (existingAvatar) {
		return existingAvatar.src;
	}

	// If it's not a bot, use a shortcut URL #2125
	if (cleanName === username) {
		const url = pageDetect.isEnterprise()
			? `/${username}.png`
			: `https://avatars.githubusercontent.com/${username}`;
		// Why use a 2x size: https://github.com/refined-github/refined-github/pull/4973#discussion_r735133613
		return url + `?size=${size * 2}`;
	}
}
