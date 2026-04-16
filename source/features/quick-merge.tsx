import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import parseCompareUrl from '../github-helpers/parse-compare-url.js';
import observe from '../helpers/selector-observer.js';
import showToast from '../github-helpers/toast.js';
import {expectToken} from '../github-helpers/github-token.js';

const buttonSelector = '.js-compare-pr button';
const buttonClass = 'rgh-quick-merge';

function addButton(compareButton: HTMLButtonElement): void {
	if (compareButton.parentElement!.querySelector(`.${buttonClass}`)) {
		return;
	}

	const comparison = parseCompareUrl(location.pathname);
	if (
		!comparison
		|| comparison.isCrossRepo
		|| comparison.base.branch === comparison.head.branch
	) {
		return;
	}

	compareButton.before(
		<button type="button" className={`btn btn-sm mr-2 ${buttonClass}`}>
			Quick merge
		</button>,
	);
}

async function mergeBranches(): Promise<void> {
	const comparison = parseCompareUrl(location.pathname);
	if (!comparison || comparison.isCrossRepo) {
		return;
	}

	if (!confirm(`Fast-forward ${comparison.base.branch} with ${comparison.head.branch}?`)) {
		return;
	}

	await showToast(async () => {
		const headReference = await api.v3(`git/ref/heads/${encodeURIComponent(comparison.head.branch)}`);
		await api.v3(`git/refs/heads/${encodeURIComponent(comparison.base.branch)}`, {
			method: 'PATCH',
			body: {
				sha: headReference.object.sha,
				force: false,
			},
		});
	}, {
		message: 'Fast-forwarding branch…',
		doneMessage: 'Opening commits…',
	});

	location.assign(buildRepoUrl('commits', comparison.base.branch));
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(buttonSelector, addButton, {signal});
	delegate(`.${buttonClass}`, 'click', mergeBranches, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	awaitDomReady: true,
	init,
});

/*
Test URLs:

- https://github.com/{owner}/{repo}/compare/{base}...{head}

*/
