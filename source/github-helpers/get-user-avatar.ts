import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';

import {assertUsername} from './index.js';

const appAvatarIds = new Map<string, string>([
	['dependabot', '29110'],
	['Copilot', '1143301'],
	['copilot-coding-agent-docs', '1143301'],
	['copilot-swe-agent', '1143301'],
]);

export default function getUserAvatar(username: string, size: number): string | void {
	const cleanName = username.replace('[bot]', '');
	assertUsername(cleanName);

	// Find image on page. Saves a request and a redirect + add support for bots
	const existingAvatar = $optional([
		`[href="/${cleanName}" i] img`,
		`[href="/apps/${cleanName}" i] img`,
	]);
	if (existingAvatar) {
		return existingAvatar.src;
	}

	const appAvatarId = appAvatarIds.get(cleanName);
	if (appAvatarId) {
		return `https://avatars.githubusercontent.com/in/${appAvatarId}?size=${size * 2}`;
	}

	// Bots don't have a /$username.png URL
	// Enterprise can only use /$username.png
	const isBot = username.endsWith('[bot]') || cleanName.includes('/');
	const url = !isBot || pageDetect.isEnterprise()
		// Use full URLs: https://github.com/refined-github/refined-github/issues/9571
		? `${location.origin}/${cleanName}.png`
		: `https://avatars.githubusercontent.com/${cleanName}`;
	// Why use a 2x size: https://github.com/refined-github/refined-github/pull/4973#discussion_r735133613
	return url + `?size=${size * 2}`;
}
