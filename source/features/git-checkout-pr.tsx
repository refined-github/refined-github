import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import oneMutation from 'one-mutation';
import * as pageDetect from 'github-url-detection';
import {CopyIcon, CheckIcon, TerminalIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo, getUsername} from '../github-helpers';

// Logic explained in https://github.com/refined-github/refined-github/pull/3596#issuecomment-720910840
function getRemoteName(): string | undefined {
	const [author] = select('.head-ref')!.title.split('/');
	if (author === getUsername()) {
		return; // `origin`, don't add remote
	}

	if (author !== getRepo()!.owner) {
		return author;
	}

	if (select('[aria-label="Edit Pull Request title"]')) {
		return; // It's a collaborator, it's likely to be `origin`
	}

	return 'upstream';
}

const connectionType = {
	HTTPS: location.origin + '/',
	SSH: `git@${location.hostname}:`,
};

function checkoutOption(remote?: string, remoteType?: 'HTTPS' | 'SSH'): JSX.Element {
	const [nameWithOwner, headBranch] = select('.head-ref')!.title.split(':');
	const [owner] = nameWithOwner.split('/');
	return (
		<div className="markdown-body">
			{remote && <p className="color-text-secondary color-fg-muted text-small my-1">{remoteType}</p>}
			<div className="snippet-clipboard-content position-relative">
				<div className="zeroclipboard-container position-absolute right-0 top-0">
					<clipboard-copy
						className="ClipboardButton btn js-clipboard-copy m-2 p-0 tooltipped-no-delay"
						role="button"
						for={`rgh-checkout-pr-${remoteType!}`}
						aria-label="Copy"
						data-copy-feedback="Copied!"
						data-tooltip-direction="w"
						tabindex="0"
					>
						<CopyIcon className="js-clipboard-copy-icon m-2"/>
						<CheckIcon className="js-clipboard-check-icon color-text-success color-fg-success d-none m-2"/>
					</clipboard-copy>
				</div>
				<pre id={`rgh-checkout-pr-${remoteType!}`}>
					<code>
						{remote && `git remote add ${remote} ${connectionType[remoteType!]}${nameWithOwner}.git\n`}
						git fetch {remote ?? 'origin'} {headBranch}{'\n'}
						git switch {remote && `--track ${owner}/`}{headBranch}
					</code>
				</pre>
			</div>
		</div>
	);
}

async function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): Promise<void> {
	dropdown.classList.add('rgh-git-checkout'); // Mark this as processed
	if (select.exists('.SelectMenu-loading', dropdown)) { // The dropdown may still be loading
		await oneMutation(dropdown, {childList: true, subtree: true});
	}

	const remoteName = getRemoteName();
	select('.octicon-terminal', dropdown)!.closest('li.Box-row')!.after(
		<li className="Box-row p-3 mt-0">
			<span className="d-flex flex-items-center color-text-primary color-fg-default text-bold no-underline">
				<TerminalIcon className="mr-2"/>
				Checkout with Git
			</span>
			<div className="mt-2 pl-5">
				<p className="color-text-secondary color-fg-muted text-small">
					Run in your project repository{remoteName && ', pick either one'}
				</p>
				{remoteName ? [
					checkoutOption(remoteName, 'HTTPS'),
					checkoutOption(remoteName, 'SSH'),
				] : checkoutOption()}
			</div>
		</li>,
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.gh-header-actions Details:not(.rgh-git-checkout)', 'toggle', handleMenuOpening, true);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	exclude: [
		pageDetect.isClosedPR,
	],
	deduplicate: false,
	init,
});
