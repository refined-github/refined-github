import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import openOptions from '../helpers/open-options.js';
import clearCacheHandler from '../helpers/clear-cache-handler.js';
import {expectTokenScope, getToken} from '../github-helpers/github-token.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';

function addNotice(adjective: JSX.Element | string): void {
	$('#issue_body_template_name')!.before(
		<div className="flash flash-error h3 my-9" style={{animation: 'pulse-in 0.3s 2'}}>
			<p>
				Your Personal Access Token is {adjective}. Some Refined GitHub features will not work without it.
				You can update it <button className="btn-link" type="button" onClick={openOptions as unknown as React.MouseEventHandler}>in the options</button>.
			</p>
			<p>Add a valid token and confirm the problem still occurs, before submitting this issue.</p>
		</div>,
	);
}

async function checkToken(): Promise<void> {
	if (!await getToken()) {
		addNotice('missing');
		return;
	}

	try {
		await expectTokenScope('repo');
	} catch {
		addNotice('invalid, expired or without enough permissions');
		return;
	}

	// Thank you for following the instructions. I'll save you a click.
	$('input[name^="issue_form[token]')!.checked = true;
}

async function setVersion(): Promise<void> {
	const {version} = chrome.runtime.getManifest();
	// Mark the submission as not having a token set up because people have a tendency to go through forms and read absolutely nothing. This makes it easier to spot liars.
	const field = $('input#issue_form_version')!;
	field.value = version;
	if (!await getToken()) {
		field.value = '(' + version + ')';
		field.disabled = true;
	}
}

async function linkifyCacheRefresh(): Promise<void> {
	$('[href="#clear-cache"]')!.replaceWith(
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
		pageDetect.isNewIssue,
		() => new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	awaitDomReady: true, // Small page
	deduplicate: 'has-rgh-inner',
	init: [
		linkifyCacheRefresh,
		checkToken,
		setVersion,
	],
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml

*/
