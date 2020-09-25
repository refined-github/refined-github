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

	const tabContainer = select('tab-container', dropdown)!;
	tabContainer.style.width = '370px';
	select('.UnderlineNav-body', tabContainer)!.append(
		<button
			name="type"
			type="button"
			role="tab"
			aria-selected="false"
			className="UnderlineNav-item flex-1 btn-link"
			tabIndex={1}
		>
			Git Checkout
		</button>
	);

	tabContainer.append(
		<div hidden role="tabpanel" className="p-3" tabIndex={1}>
			<p className="text-gray text-small">
				Run in your project repository
			</p>
			<div className="copyable-terminal">
				<div className="copyable-terminal-button">
					<clipboard-copy
						className="btn btn-sm zeroclipboard-button"
						role="button"
						for="checkout-remote-help-step-1"
						aria-label="Copy to clipboard"
						data-copy-feedback="Copied!"
					>
						<ClippyIcon/>
					</clipboard-copy>
				</div>
				<pre
					id="checkout-remote-help-step-1"
					className="copyable-terminal-content"
				>
					<span className="user-select-contain">git remote add {user} https://github.com/{user}/{repository}.git</span>
				</pre>
			</div>
			<p className="text-gray text-small">
				<strong>Step 2: </strong>
				Checkout the branch
			</p>
			<div className="copyable-terminal">
				<div className="copyable-terminal-button">
					<clipboard-copy
						className="btn btn-sm zeroclipboard-button"
						role="button"
						for="checkout-remote-help-step-2"
						aria-label="Copy to clipboard"
						data-copy-feedback="Copied!"
					>
						<ClippyIcon/>
					</clipboard-copy>
				</div>
				<pre
					id="checkout-remote-help-step-2"
					className="copyable-terminal-content"
				>
					<span className="user-select-contain">git checkout {user}/{getCurrentBranch()}</span>
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
	init
});
