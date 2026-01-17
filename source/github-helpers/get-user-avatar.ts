import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import CopilotIcon from 'octicons-plain-react/Copilot';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type SVGAvatar = (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;

export function getUserAvatar(username: string, size: number): string | SVGAvatar | void {
	const cleanName = username.replace('[bot]', '');

	if (/[^\w-]/.test(cleanName)) {
		throw new TypeError(`Expected a username, got ${cleanName}`);
	}

	// Find image on page. Saves a request and a redirect + add support for bots
	const existingAvatar = $optional(`[href="/${cleanName}" i] img`);
	if (existingAvatar) {
		return existingAvatar.src;
	}

	if (
		cleanName === 'Copilot'
		|| cleanName === 'copilot-coding-agent-docs'
		|| cleanName === 'copilot-swe-agent'
	) {
		return CopilotIcon;
	}

	const url = pageDetect.isEnterprise()
		? `/${cleanName}.png`
		: `https://avatars.githubusercontent.com/${cleanName}`;
		// Why use a 2x size: https://github.com/refined-github/refined-github/pull/4973#discussion_r735133613
	return url + `?size=${size * 2}`;
}
