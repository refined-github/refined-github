import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import openOptions from '../helpers/open-options';
import clearCacheHandler from '../helpers/clear-cache-handler';
import {expectTokenScope} from '../github-helpers/api';
import {isRefinedGitHubRepo} from '../github-helpers';

function init(): void {
	const {version} = browser.runtime.getManifest();
	select('input#issue_form_extension_version')!.value = version;
	select('[href="#clear-cache"]')!.replaceWith(
		<button
			className="btn"
			type="button"
			onClick={clearCacheHandler as unknown as React.MouseEventHandler}
		>
			Clear cache
		</button>,
	);
	void expectTokenScope('repo').catch(() => {
		select('#issue_body_template_name')!.before(
			<div className="flash flash-warn m-2">
				Your Personal Access Token is either missing, incorrect or expired. Some Refined GitHub features will not work without it.<br/>
				You can update it <a href="#" onClick={openOptions as unknown as React.MouseEventHandler}>in the options</a>.
			</div>,
		);
	});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
		pageDetect.isNewIssue,
		() => new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	deduplicate: 'has-rgh-inner',
	init,
});
