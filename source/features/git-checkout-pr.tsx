import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {ClippyIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCurrentBranch, getPRHeadRepo, getRepo, getUsername} from '../github-helpers';

// Logic explained in https://github.com/sindresorhus/refined-github/pull/3596#issuecomment-720910840
function getRemoteName(): string | undefined {
	const author = getPRHeadRepo()!.owner;
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
	SSH: `git@${location.hostname}:`
};

function checkoutOption(remote?: string, remoteType?: 'HTTPS' | 'SSH'): JSX.Element {
	return (
		<>
			{remote && <p className="text-gray color-text-secondary text-small my-1">{remoteType}</p>}
			<div className="copyable-terminal">
				<div className="copyable-terminal-button">
					<clipboard-copy
						className="btn btn-sm zeroclipboard-button"
						role="button"
						for={`rgh-checkout-pr-${remoteType!}`}
						aria-label="Copy to clipboard"
						data-copy-feedback="Copied!"
					>
						<ClippyIcon/>
					</clipboard-copy>
				</div>
				<pre
					id={`rgh-checkout-pr-${remoteType!}`}
					className="copyable-terminal-content"
				>
					<span className="user-select-contain">
						{remote && `git remote add ${remote} ${connectionType[remoteType!]}${getPRHeadRepo()!.nameWithOwner}.git\n`}
						git fetch {remote ?? 'origin'} {getCurrentBranch()}{'\n'}
						git switch {remote && `--track ${getPRHeadRepo()!.owner}/`}{getCurrentBranch()}
					</span>
				</pre>
			</div>
		</>
	);
}

function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-git-checkout'); // Mark this as processed
	const tabContainer = select('[action="/users/checkout-preference"]', dropdown)!.closest<HTMLElement>('tab-container')!;
	tabContainer.style.minWidth = '370px';
	select('.UnderlineNav-body', tabContainer)!.append(
		<button
			name="type"
			type="button"
			role="tab"
			aria-selected="false"
			className="UnderlineNav-item flex-1 btn-link"
		>
			Git Checkout
		</button>
	);

	const remoteName = getRemoteName();
	tabContainer.append(
		<div hidden role="tabpanel" className="p-3">
			<p className="text-gray color-text-secondary text-small">
				Run in your project repository{remoteName && ', pick either one'}
			</p>
			{remoteName ? [
				checkoutOption(remoteName, 'HTTPS'),
				checkoutOption(remoteName, 'SSH')
			] : checkoutOption()}
		</div>
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.gh-header-actions Details:not(.rgh-git-checkout)', 'toggle', handleMenuOpening, true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPR
	],
	exclude: [
		pageDetect.isClosedPR
	],
	init
});
