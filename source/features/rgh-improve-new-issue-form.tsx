import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {baseApiFetch} from '../github-helpers/github-token.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import clearCacheHandler from '../helpers/clear-cache-handler.js';
import {getElementByAriaLabelledBy} from '../helpers/dom-utils.js';
import {getExtensionReleaseDate, toDaysAgo, wasReleasedLongAgo} from '../helpers/extension-release-age.js';
import {OptionsLink} from '../helpers/open-options.js';
import observe from '../helpers/selector-observer.js';
import setReactInputValue from '../helpers/set-react-input-value.js';
import {getToken} from '../options-storage.js';
import delay from '../helpers/delay.js';

const isSetTheTokenSelector = 'input[type="checkbox"][required]';
const liesGif = 'https://github.com/user-attachments/assets/f417264f-f230-4156-b020-16e4390562bd';

function addNotice(type: 'error' | 'warn', message: JSX.Element): void {
	$('[class^="IssueFormElements-module__formElementsContainer"]').prepend(
		<div className={`flash flash-${type} h3 my-9`} style={{animation: 'pulse-in 0.3s 2'}}>
			{message}
		</div>,
	);
}

function addTokenNotice(adjective: string): void {
	addNotice(
		'error',
		<>
			<p>
				Your token is {adjective}. Many Refined GitHub features don't work without it. You can update it{' '}
				<OptionsLink className="btn-link">in the options</OptionsLink>.
			</p>
			<p>Before creating this issue, add a valid token and confirm the problem still occurs.</p>
		</>,
	);
}

function addVersionNotice(releaseAgeInDays: number): void {
	addNotice(
		'warn',
		<p>
			Your Refined GitHub version is {releaseAgeInDays} days old.{' '}
			<a href="https://github.com/refined-github/refined-github#install">A newer version may be available.</a>
		</p>,
	);
}

async function checkToken(): Promise<void> {
	const token = await getToken();
	if (!token) {
		addTokenNotice('missing');
		return;
	}

	try {
		await baseApiFetch({apiBase: 'https://api.github.com/', path: 'user', token});
	} catch (error) {
		if (!navigator.onLine || (error as any)?.message === 'Failed to fetch') {
			return;
		}

		addTokenNotice('invalid or expired');
		return;
	}

	// Thank you for following the instructions. I'll save you a click.
	$(isSetTheTokenSelector).checked = true;
}

async function setVersion(): Promise<void> {
	const {version} = chrome.runtime.getManifest();
	const field = getElementByAriaLabelledBy<HTMLInputElement>(
		'span[class^="TextInputElement-module__issueFormTextField"] > input',
		'Extension version*',
	);

	// Wait for GitHub's listener to be attached #9293
	await delay(2000);

	setReactInputValue(field, version);
	if (!await getToken()) {
		// Mark the submission as not having a token set up because people have a tendency to go through forms and read absolutely nothing. This makes it easier to spot liars.
		setReactInputValue(field, '(' + version + ')');
		field.disabled = true;
	}
}

function checkVersionAge(): void {
	const releaseDate = getExtensionReleaseDate();
	const releaseAgeInDays = toDaysAgo(releaseDate);
	if (wasReleasedLongAgo(releaseAgeInDays)) {
		addVersionNotice(releaseAgeInDays);
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

function init(signal: AbortSignal): void {
	observe('[class^="CreateIssueForm-module__mainContentSection"]', () => {
		void linkifyCacheRefresh();
		void checkToken();
		void validateTokenCheckbox();
		void setVersion();
		checkVersionAge();
	}, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
		pageDetect.isNewIssue,
		() => new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml

*/
