import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import clearCacheHandler from '../helpers/clear-cache-handler';
import {isRefinedGitHubRepo} from '../github-helpers';
import {expectToken, expectTokenScope} from '../github-helpers/api';

async function validateToken(): Promise<void> {
	try {
		await expectToken();
	} catch {
		throw new Error('Refined GitHub needs a Personal Access Token to work properly.');
	}

	try {
		await expectTokenScope('repo');
	} catch {
		throw new Error('Your Personal Access Token is valid but missing the `repo` scope. Many features will not work.');
	}

	try {
		await expectTokenScope('delete_repo');
	} catch {
		throw new Error('Your Personal Access Token is valid but missing the `delete_repo` scope. The `quick-repo-deletion` feature will not work.');
	}
}

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
	void validateToken().catch(error => {
		select('#issue_body_template_name')!.before(
			<div className="flash flash-warn m-2">
				{error.message}
			</div>,
		);
	});
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
