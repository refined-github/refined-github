import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';

const getLoader = onetime((): HTMLElement =>
	<img alt="" className="loader" src="https://github.githubassets.com/images/spinners/octocat-spinner-32-EAF2F5.gif" width="16" height="16" />
);

async function handleRevertFileClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const menuItem = event.currentTarget;
	menuItem.append(getLoader());
	event.preventDefault();
	event.stopPropagation();

	const {ownerName, repoName} = getOwnerAndRepo();

	try {
		const {repository: {pullRequest: {baseRef}}} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: 46) {
					baseRef: baseRefOid
				}
			}
		}`);

		const filePath = (menuItem.closest('[data-path]') as HTMLElement).dataset.path!; // TODO: works with spaces?
		const {repository: {file}} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				file: object(expression: "${baseRef}:${filePath}") {
					... on Blob {
						text
					}
				}
			}
		}`);

		if (!file) {
			// The file was added by this PR. Click the "Delete file" link instead
			(menuItem.nextElementSibling as HTMLElement).click();
			return;
		}

		if (file.isTruncated) {
			menuItem.remove();
			alert('File too big. Can’t do.'); // TODO
		}

		console.log(file)
	} catch (error) {
		console.log(error)
		menuItem.append('. Error.');
	}

	getLoader().remove();
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = event.delegateTarget.nextElementSibling!;

	const editFile = select<HTMLAnchorElement>('[aria-label^="Change this"]', dropdown);
	if (!editFile || select.exists('[href*="rgh-revert-to="]', dropdown)) {
		return;
	}

	const url = new URL(editFile.href);
	url.searchParams.set('rgh-revert-to', select('.base-ref')!.title);

	editFile.after(
		<button
			className="pl-5 dropdown-item btn-link"
			role="menuitem"
			type="button"
			onClick={handleRevertFileClick}
		>
			Revert file
		</button>
	);
}

function init(): void {
	delegate('.js-file-header-dropdown > summary', 'click', handleMenuOpening);
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
