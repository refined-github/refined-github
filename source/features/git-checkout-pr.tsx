import React from 'dom-chef';
import select from 'select-dom';
import oneMutation from 'one-mutation';
import * as pageDetect from 'github-url-detection';
import type {DelegateEvent} from 'delegate-it';
import delegate from 'delegate-it';
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
		<div hidden={remoteType && remoteType !== 'HTTPS'} className="markdown-body" role="tabpanel">
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
				<pre id={`rgh-checkout-pr-${remoteType!}`} className="mb-2 rgh-linkified-code">{/* `.rgh-linkified-code` is intentionally added to avoid parsing */}
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

function getTabList(tabs: string[], selected = tabs[0]): JSX.Element {
	return (
		<div className="UnderlineNav my-2 box-shadow-none">
			<div className="UnderlineNav-body" role="tablist">
				{tabs.map(tab => (
					<button
						type="button"
						role="tab"
						className="UnderlineNav-item lh-default f6 py-0 px-0 mr-2 position-relative"
						// Style won't apply if using the boolean directly
						aria-selected={tab === selected ? 'true' : 'false'}
						tabIndex={tab === selected ? 0 : -1}
					>
						{tab}
					</button>
				))}
			</div>
		</div>
	);
}

async function handleMenuOpening({delegateTarget: dropdown}: DelegateEvent): Promise<void> {
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
				<tab-container>
					{remoteName ? [
						getTabList(['HTTPS', 'SSH']),
						checkoutOption(remoteName, 'HTTPS'),
						checkoutOption(remoteName, 'SSH'),
					] : checkoutOption()}
				</tab-container>
				<p className="mb-0 f6 color-text-secondary color-fg-muted">
					Run in your project repository{remoteName && ', pick either one'}.
				</p>
			</div>
		</li>,
	);
}

function init(signal: AbortSignal): void {
	// `capture: true` required to be fired before GitHub's handlers
	delegate(document, '.gh-header-actions Details:not(.rgh-git-checkout)', 'toggle', handleMenuOpening, {capture: true, signal});
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
