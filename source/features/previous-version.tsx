import * as pageDetect from 'github-url-detection';

import React from 'dom-chef';

import cache from 'webext-storage-cache';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import observe from '../helpers/selector-observer';

import GitHubURL from '../github-helpers/github-url';

const getHistoryOids = cache.function('file-history', async (branch: string, filePath: string): Promise<string[] | false> => {
	const {resource: {history}} = await api.v4(`
		resource(url: "/refined-github/refined-github/commit/${branch}") {
			... on Commit {
				history(path: "${filePath}") {
					nodes {
						oid
					}
				}
			}
		}
	`);

	const nodes = history.nodes as any[];

	if (nodes.length === 0) {
		return false;
	}

	return nodes.map<string>(n => n.oid);
});

const add = async (actionButtons: HTMLElement): Promise<void> => {
	const githubUrl = new GitHubURL(location.href);
	const historyOids = await getHistoryOids(githubUrl.branch, githubUrl.filePath);

	if (!historyOids) {
		return;
	}

	const button = (
		<div className="BtnGroup ml-1">
			<div className="BtnGroup-parent">
				{(() => {
					const button = (
						<div className="btn-sm BtnGroup-item btn">
							Previous
						</div>
					);

					button.addEventListener('click', () => {
						const url = new GitHubURL(location.href);
						url.branch = historyOids[1];
						location.href = url.toString();
					});

					return button;
				})()}
			</div>

			<details className="details-reset details-overlay select-menu BtnGroup-parent d-inline-block position-relative" open={false}>
				<summary
					data-disable-invalid="" data-disable-with=""
					data-dropdown-tracking={'{"type":"blob_edit_dropdown.more_options_click","context":{"repository_id":51769689,"actor_id":null,"github_dev_enabled":false,"edit_enabled":false,"small_screen":false}'}
					aria-label="Select additional options" data-view-component="true"
					className="js-blob-dropdown-click select-menu-button btn-sm btn BtnGroup-item float-none px-2"
				/>
				<div className="SelectMenu right-0">
					<div className="SelectMenu-modal width-full">
						<div className="SelectMenu-list SelectMenu-list--borderless py-2">
							{historyOids.slice(2).map((element, i) => {
								const item = (
									<div className="SelectMenu-item no-wrap text-normal f5">
										<div className="d-flex width-full gap-4">
											<div className="color-fg-default flex-auto">{i + 2} commits ago</div>
											<div className="color-fg-muted flex-shrink-0">{element.slice(0, 7)}</div>
										</div>
									</div>
								);

								item.addEventListener('click', () => {
									const url = new GitHubURL(location.href);
									url.branch = element;
									location.href = url.toString();
								});

								return item;
							})}
						</div>
					</div>
				</div>
			</details>
		</div>
	);

	actionButtons.prepend(button);
};

async function init(signal: AbortSignal): Promise<false | void> {
	const githubUrl = new GitHubURL(location.href);
	const historyOids = await getHistoryOids(githubUrl.branch, githubUrl.filePath);

	if (!historyOids) {
		return false;
	}

	observe([
		'#repos-sticky-header .react-blob-header-edit-and-raw-actions',	// For signed in
		'readme-toc .Box-header.js-blob-header div:has(.BtnGroup)',			// For not signed in
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	init,
});
