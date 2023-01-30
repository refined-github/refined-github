import React from 'dom-chef';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function add(folderDropdown: HTMLElement): void {
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);

	folderDropdown.before(
		// The buttons are spaced via `gap` on `md+` resolutions, and via `margin` at `sm`
		<a
			className="btn tooltipped tooltipped-nw rgh-download-folder mr-2 mr-md-0"
			aria-label="Download directory"
			href={downloadUrl.href}
		>
			<DownloadIcon/>
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe('[title="More options"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoRoot, // Already has an native download ZIP button
	],
	init,
});
