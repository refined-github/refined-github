import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import DiffIcon from 'octicons-plain-react/Diff';

import features from '../feature-manager.js';
import {getCleanPathname} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function getPrUrl(extension: 'patch' | 'diff'): string {
	// Extract the repository path and PR ID
	const pathname = getCleanPathname();
	const [owner, repo, , id] = pathname.split('/');

	// Construct the consistent .diff or .patch URL
	return `/${owner}/${repo}/pull/${id}.${extension}`;
}

function updatePrUrl(
	event: React.FocusEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement>,
): void {
	const link = event.currentTarget;
	link.href = getPrUrl(link.textContent as 'patch' | 'diff');
}

function createLink(type: 'patch' | 'diff'): JSX.Element {
	return (
		<a
			href={getPrUrl(type)} // Always points to the consistent PR .diff or .patch URL
			className="sha color-fg-default"
			// Update URL because it might be out of date due to SPA navigation
			// https://github.com/refined-github/refined-github/issues/8737
			onMouseEnter={updatePrUrl}
			onFocus={updatePrUrl}
		>
			{type}
		</a>
	);
}

async function addPrPatchDiffLinks(prHeader: HTMLElement): Promise<void> {
	prHeader.append(
		<li
			className="mx-0 tmp-py-3 tmp-px-4 width-full rounded-0"
		>
			<div className="d-flex flex-items-center text-bold">
				<DiffIcon className="mr-2" />
				<div className="sha-block" data-turbo="false">
					{createLink('patch')}
					{' '}
					{createLink('diff')}
				</div>
			</div>
		</li>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.react-overview-code-button-action-list > ul', addPrPatchDiffLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	init,
});

/*

Test URLs:

- PR: https://github.com/refined-github/refined-github/pull/7751

*/
