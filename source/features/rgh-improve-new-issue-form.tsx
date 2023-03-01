import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import openOptions from '../helpers/open-options';
import clearCacheHandler from '../helpers/clear-cache-handler';
import {expectToken, expectTokenScope} from '../github-helpers/api';
import {isRefinedGitHubRepo} from '../github-helpers';

function addNotice(adjective: JSX.Element | string): void {
	select('#issue_body_template_name')!.before(
		<div className="flash flash-warn m-2">
			Your Personal Access Token is {adjective}. Some Refined GitHub features will not work without it.
			You can update it <button className="btn-link" type="button" onClick={openOptions as unknown as React.MouseEventHandler}>in the options</button>.
		</div>,
	);
}

async function checkToken(): Promise<void> {
	try {
		await expectToken();
	} catch {
		addNotice('missing');
		return;
	}

	try {
		await expectTokenScope('repo');
	} catch {
		addNotice('invalid or expired');
	}
}

async function setVersion(): Promise<void> {
	const {version} = browser.runtime.getManifest();
	select('input#issue_form_version')!.value = version;
}

async function linkifyCacheRefresh(): Promise<void> {
	select('[href="#clear-cache"]')!.replaceWith(
		<button
			className="btn"
			type="button"
			onClick={clearCacheHandler as unknown as React.MouseEventHandler}
		>
			Clear cache
		</button>,
	);
}

async function init(): Promise<void> {
	// Async functions so they're independent
	await Promise.all([
		linkifyCacheRefresh(),
		checkToken(),
		setVersion(),
	]);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
		pageDetect.isNewIssue,
		() => new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	awaitDomReady: true, // Small page
	deduplicate: 'has-rgh-inner',
	init,
});
