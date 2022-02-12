import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import clearCacheHandler from '../helpers/clear-cache-handler';
import {isRefinedGitHubRepo} from '../github-helpers';

function init(): void {
	const {version} = browser.runtime.getManifest();
	select('input#issue_form_extension_version')!.value = version;
	select('input[id*="extension_cache"]')!.parentElement!.after(
		<button
			className="btn"
			type="button"
			onClick={clearCacheHandler as unknown as React.MouseEventHandler}
		>
			Clear cache
		</button>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		() => pageDetect.isNewIssue() && new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	deduplicate: 'has-rgh-inner',
	init,
});
