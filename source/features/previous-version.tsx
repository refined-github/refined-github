import cache from 'webext-storage-cache';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

const getPastCommits = cache.function('previous-version', async (pathname: string): Promise<string[]> => {
	const {user, repository, branch, filePath} = new GitHubURL(pathname);
	const {resource} = await api.v4(`
		resource(url: "/${user}/${repository}/commit/${branch}") {
			... on Commit {
				history(path: "${filePath}", first: 5) {
					nodes {
						oid
					}
				}
			}
		}
	`);

	// The first commit refers to the current one, so we drop it
	const nodes = resource.history.nodes.slice(1) as any[];
	return nodes.map(node => node.oid);
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 1},
});

function createDetailsButton(pastCommits: string[], url: GitHubURL): Element | void {
	return (
		<details
			className="details-reset details-overlay select-menu BtnGroup-parent d-inline-block position-relative"
		>
			<summary className="js-blob-dropdown-click select-menu-button btn-sm btn BtnGroup-item float-none px-2"/>
			<div className="SelectMenu right-0">
				<div className="SelectMenu-modal width-full">
					<div className="SelectMenu-list SelectMenu-list--borderless py-2">
						{pastCommits.map((branch, i) => (
							<a href={url.assign({branch}).href} className="SelectMenu-item no-wrap text-normal f5">
								<div className="d-flex width-full gap-4">
									<div className="color-fg-default flex-auto">{i + 2} commits ago</div>
									<div className="color-fg-muted flex-shrink-0">{branch.slice(0, 7)}</div>
								</div>
							</a>
						))}
					</div>
				</div>
			</div>
		</details>
	);
}

async function add(actionButtons: HTMLElement): Promise<void> {
	const pastCommits = await getPastCommits(location.href);

	if (pastCommits.length === 0) {
		return;
	}

	const url = new GitHubURL(location.href);
	url.branch = pastCommits[0];

	actionButtons.prepend(
		<div className="BtnGroup ml-1">
			<div className="BtnGroup-parent tooltipped tooltipped-n" aria-label="View previous version of this file">
				<a href={url.href} className="btn-sm BtnGroup-item btn">
					Previous
				</a>
			</div>

			{pastCommits.length > 1 && createDetailsButton(pastCommits.slice(1), url)}
		</div>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('#repos-sticky-header .react-blob-header-edit-and-raw-actions', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	init,
});
