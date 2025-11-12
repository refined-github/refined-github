import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {OptionsLink} from '../helpers/open-options.js';
import clearCacheHandler from '../helpers/clear-cache-handler.js';
import {baseApiFetch} from '../github-helpers/github-token.js';
import {getToken} from '../options-storage.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import delay from '../helpers/delay.js';
import {getElementByAriaLabelledBy} from '../helpers/dom-utils.js';

const isSetTheTokenSelector = 'input[type="checkbox"][required]';
const liesGif = 'https://github.com/user-attachments/assets/f417264f-f230-4156-b020-16e4390562bd';

function addNotice(adjective: JSX.Element | string): void {
	$('#issue_body_template_name').before(
		<div className="flash flash-error h3 my-9" style={{animation: 'pulse-in 0.3s 2'}}>
			<p>
				Your token is {adjective}. Many Refined GitHub features don't work without it.
				You can update it <OptionsLink className="btn-link">in the options</OptionsLink>.
			</p>
			<p>Before creating this issue, add a valid token and confirm the problem still occurs.</p>
		</div>,
	);
}

async function checkToken(): Promise<void> {
	const token = await getToken();
	if (!token) {
		addNotice('missing');
		return;
	}

	try {
		await baseApiFetch({apiBase: 'https://api.github.com/', path: 'user', token});
	} catch (error) {
		if (!navigator.onLine || (error as any)?.message === 'Failed to fetch') {
			return;
		}

		addNotice('invalid or expired');
		return;
	}

	// Thank you for following the instructions. I'll save you a click.
	$(isSetTheTokenSelector).checked = true;
}

async function setVersion(): Promise<void> {
	await delay(1000); // I give up https://github.com/refined-github/refined-github/issues/8296#issuecomment-2765270023
	const {version} = chrome.runtime.getManifest();
	const field = getElementByAriaLabelledBy<HTMLInputElement>(
		'[class^="IssueCreatePage"] [class^="Box-sc"] input',
		'Extension version*',
	);

	field.value = version;
	if (!await getToken()) {
		// Mark the submission as not having a token set up because people have a tendency to go through forms and read absolutely nothing. This makes it easier to spot liars.
		field.value = '(' + version + ')';
		field.disabled = true;
	}
}

async function linkifyCacheRefresh(): Promise<void> {
	$('[href="#clear-cache"]').replaceWith(
		<button
			className="btn"
			type="button"
			onClick={clearCacheHandler}
		>
			Clear cache
		</button>,
	);
}

function Lies(): JSX.Element {
	return (
		<a href="https://www.youtube.com/watch?v=YWdD206eSv0">
			<img src={liesGif} alt="Just go on the internet and tell lies?" className="d-inline-block" />
		</a>
	);
}

async function lieDetector({delegateTarget}: DelegateEvent<MouseEvent, HTMLInputElement>): Promise<void> {
	if (delegateTarget.checked) {
		delegateTarget.closest('fieldset')!.append(<Lies />);
	}
}

async function validateTokenCheckbox(): Promise<void> {
	if (await getToken()) {
		return;
	}

	// eslint-disable-next-line new-cap -- Preload image
	Lies();

	delegate(isSetTheTokenSelector, 'click', lieDetector, {
		once: true,
	});
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
		validateTokenCheckbox,
		setVersion,
	],
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml

*/
