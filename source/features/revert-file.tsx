import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getRepoURL, getDiscussionNumber} from '../libs/utils';

async function handleRevertFileClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const menuItem = event.currentTarget;
	menuItem.textContent = 'Reverting…';
	event.preventDefault();
	event.stopPropagation();

	const {ownerName, repoName} = getOwnerAndRepo();
	try {
		// Get the real base commit of this PR, not the HEAD of base branch
		const {repository: {pullRequest: {baseRefOid}}} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: ${getDiscussionNumber()}) {
					baseRefOid
				}
			}
		}`);

		const filePath = (menuItem.closest('[data-path]') as HTMLElement).dataset.path!;
		const [, forkRepoURL, forkBranch]: string[] = /^([^:]+):(.+)$/.exec(select('.head-ref')!.title) || [];
		const [originalFile, forkFile] = await Promise.all([
			api.v3(`repos/${getRepoURL()}/contents/${filePath}?ref=${baseRefOid}`, {ignoreHTTPStatus: true}),
			api.v3(`repos/${forkRepoURL}/contents/${filePath}?ref=${forkBranch}`, {ignoreHTTPStatus: true})
		]);

		if (originalFile.content === undefined) {
			// The file was added by this PR. Click the "Delete file" link instead.
			// The `a` selector skips the broken Delete link on some pages. GitHub's bug.
			select('[aria-label^="Delete this"]', menuItem.parentElement!)!.click();
			return;
		}

		// API limit: https://developer.github.com/v3/repos/contents/#get-contents
		if (originalFile.size > 1000000) {
			menuItem.disabled = true;
			menuItem.textContent = 'Revert failed: File too big';
			menuItem.style.cssText = 'white-space: pre-wrap';
		}

		await api.v3(`repos/${forkRepoURL}/contents/${filePath}`, {
			method: 'PUT',
			body: {
				sha: forkFile.sha,
				branch: forkBranch,
				content: originalFile.content,
				message: `Revert ${originalFile.name}`
			}
		});

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error) {
		console.log(error);
		menuItem.disabled = true;
		menuItem.textContent = 'Revert failed. See console for errors';
		menuItem.style.cssText = 'white-space: pre-wrap';
	}
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = event.delegateTarget.nextElementSibling!;

	const editFile = select<HTMLAnchorElement>('[aria-label^="Change this"]', dropdown);
	if (!editFile || select.exists('.rgh-revert-file', dropdown)) {
		return;
	}

	editFile.after(
		<button
			className="pl-5 dropdown-item btn-link rgh-revert-file"
			role="menuitem"
			type="button"
			onClick={handleRevertFileClick}
		>
			Revert file
		</button>
	);
}

function init(): void {
	delegate('#files', '.js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Revert all the changes to a file in a PR',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
