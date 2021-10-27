import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {buildRepoURL} from '../github-helpers';

async function init(): Promise<void | false> {
	const element = await elementReady(pageDetect.isQuickPR() ? '.branch-name' : '.commit-form .branch-name');
	if (!element) {
		return false;
	}

	const branchUrl = buildRepoURL('tree', element.textContent!);
	element.replaceWith(
		<span className="commit-ref">
			<a className="no-underline" href={branchUrl} data-pjax="#repo-content-pjax-container">
				{element.textContent}
			</a>
		</span>,
	);
}

function hovercardInit(): void {
	observe('[data-hydro-view*="pull-request-hovercard-hover"] ~ .d-flex.mt-2', {
		add(hovercard) {
			const {href} = hovercard.querySelector('a.Link--primary')!;

			for (const reference of hovercard.querySelectorAll<HTMLElement>('.commit-ref')) {
				const url = new GitHubURL(href).assign({
					route: 'tree',
					branch: reference.title,
				});

				const user = reference.querySelector('.user');
				if (user) {
					url.user = user.textContent!;
				}

				reference.replaceChildren(
					<a className="color-text-secondary color-fg-muted" href={url.href}>
						{[...reference.childNodes]}
					</a>,
				);
			}
		},
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isQuickPR,
		pageDetect.isEditingFile,
		pageDetect.isDeletingFile,
	],
	init,
}, {
	init: onetime(hovercardInit),
});
