import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import ClippyIcon from 'octicon/clippy.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCurrentBranch} from '../github-helpers';

function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-git-checkout'); // Mark this as processed
	const [, user, repository] = select<HTMLAnchorElement>('.commit-ref.head-ref a')!.pathname.split('/', 3);
	const isLocalPr = select('.user-select-contain.head-ref a')!.childElementCount === 1;
	const tabContainer = select('[action="/users/checkout-preference"]', dropdown)!.closest<HTMLElement>('tab-container')!;
	tabContainer.style.width = 'fit-content';
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

	tabContainer.append(
		<div hidden role="tabpanel" className="p-3">
			<p className="text-gray text-small">
				Run in your project repository
			</p>
			<div className="copyable-terminal">
				<div className="copyable-terminal-button">
					<clipboard-copy
						className="btn btn-sm zeroclipboard-button"
						role="button"
						for="rgh-checkout-pr"
						aria-label="Copy to clipboard"
						data-copy-feedback="Copied!"
					>
						<ClippyIcon/>
					</clipboard-copy>
				</div>
				<pre
					id="rgh-checkout-pr"
					className="copyable-terminal-content"
				>
					<span className="user-select-contain">
						{isLocalPr ? '' : `git remote add ${user} ${location.origin}/${user}/${repository}.git\n`}
						git switch {user}/{getCurrentBranch()}
					</span>
				</pre>
			</div>
		</div>
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.gh-header-actions Details:not(.rgh-git-checkout)', 'toggle', handleMenuOpening, true);
}

void features.add({
	id: __filebasename,
	description: 'Adds a tab with instruction to checkout a remote PR branch locally.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/94288432-64e7b100-ff25-11ea-8991-b8ef3d4a9ba3.png'
}, {
	include: [
		pageDetect.isPR
	],
	exclude: [
		() => select.exists('#partial-discussion-header [title="Status: Merged"]')
	],
	init
});
