import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import TrashIcon from 'octicons-plain-react/Trash';
import {$optional, $$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {addAfterBranchSelector, buildRepoURL} from '../github-helpers/index.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {branchSelector, branchSelectorParent} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';

const deleteBranchHash = '#rgh-delete-branch';

function getDeleteBranchUrl(branch: string): string {
	const deleteUrl = new URL(buildRepoURL('branches/all'));
	deleteUrl.searchParams.set('query', branch);
	deleteUrl.hash = deleteBranchHash;
	return deleteUrl.href;
}

function findActionButton(scope: ParentNode, label: string): HTMLElement | undefined {
	return $$<HTMLElement>('button, summary', scope).find(button => button.textContent?.trim() === label);
}

function findCodeButton(scope: ParentNode): HTMLButtonElement | undefined {
	const codeIcon = scope.querySelector('svg.octicon-code');
	return codeIcon?.closest('button') ?? undefined;
}

function getOrCreateButton(branch: string): HTMLAnchorElement {
	const existing = $optional<HTMLAnchorElement>('.rgh-delete-current-branch');
	if (existing) {
		existing.href = getDeleteBranchUrl(branch);
		return existing;
	}

	return (
		<a
			className="btn btn-sm btn-danger rgh-delete-current-branch"
			href={getDeleteBranchUrl(branch)}
			data-turbo-frame="repo-content-turbo-frame"
			aria-label="Delete current branch"
		>
			<TrashIcon className="mr-1" />
			Delete branch
		</a>
	);
}

function addToBranchInfoBar(container: HTMLElement): void {
	const branch = getCurrentGitRef();
	if (!branch) {
		return;
	}

	const button = getOrCreateButton(branch);
	container.append(button);
}

async function addButton(branchSelectorElement: HTMLElement): Promise<void> {
	const branch = getCurrentGitRef();
	if (!branch) {
		return;
	}

	const row = branchSelectorElement.closest('.position-relative');
	if (row && $optional('.rgh-delete-current-branch', row)) {
		return;
	}

	const button = getOrCreateButton(branch);

	if (branchSelectorElement.tagName === 'SUMMARY' || branchSelectorElement.tagName === 'DETAILS') {
		const details = branchSelectorElement.tagName === 'SUMMARY'
			? branchSelectorElement.parentElement as HTMLDetailsElement
			: branchSelectorElement as HTMLDetailsElement;
		addAfterBranchSelector(details, button);
		return;
	}

	const scope = branchSelectorElement.closest('#repo-content-pjax-container') ?? document;
	const codeButton = findCodeButton(scope);
	const codeButtonParent = codeButton?.parentElement;
	if (codeButton && codeButtonParent) {
		codeButtonParent.insertBefore(button, codeButton);
		codeButtonParent.classList.add('d-flex', 'gap-2', 'flex-shrink-0');
		return;
	}

	const anchorButton = findActionButton(scope, 'Contribute')
		?? findActionButton(scope, 'Open more actions menu')
		?? findActionButton(scope, 'Code');
	const anchorParent = anchorButton?.parentElement;
	if (anchorButton && anchorParent) {
		anchorParent.insertBefore(button, anchorButton);
		anchorParent.classList.add('d-flex', 'gap-2', 'flex-shrink-0');
		return;
	}

	const wrapper = branchSelectorElement;
	wrapper.after(button);
	row?.classList.add('d-flex', 'flex-shrink-0', 'gap-2');
}

function clickDeleteButton(branchLabel: HTMLElement): void {
	const branch = new URLSearchParams(location.search).get('query');
	if (!branch || branchLabel.getAttribute('title') !== branch) {
		return;
	}

	const row = branchLabel.closest('tr.TableRow');
	const deleteButton = row?.querySelector<HTMLButtonElement>('button[aria-label^="Delete branch"]');
	deleteButton?.click();
}

function initBranchesPage(signal: AbortSignal): void {
	if (location.hash !== deleteBranchHash) {
		return;
	}

	observe('react-app[app-name=repos-branches] a[class*=BranchName] div[title]', clickDeleteButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		isDefaultBranch,
	],
	init: async (signal: AbortSignal): Promise<void> => {
		observe('[data-testid="branch-info-bar"] .d-flex.gap-2', addToBranchInfoBar, {signal});
		observe([branchSelector, branchSelectorParent], addButton, {signal});
	},
}, {
	include: [
		pageDetect.isBranches,
		() => location.hash === deleteBranchHash,
	],
	awaitDomReady: true,
	init: initBranchesPage,
});

/*
Test URLs:

1. https://github.com/refined-github/refined-github/tree/test/bun
2. https://github.com/refined-github/refined-github/branches/all?query=test%2Fbun#rgh-delete-branch

*/
