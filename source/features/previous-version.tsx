import cache from 'webext-storage-cache';
import React from 'dom-chef';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url'; 

const getPastCommits = cache.function('previous-version', async (currHref: string): Promise<string[] | false> => {
	const githubUrl = new GitHubURL(currHref);
	const {resource: {history}} = await api.v4(`
		resource(url: "/${githubUrl.user}/${githubUrl.repository}/commit/${githubUrl.branch}") {
			... on Commit {
				history(path: "${githubUrl.filePath}", first: 5) {
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

	return nodes.map(node => node.oid as string);
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 1},
	cacheKey: ([currHref]) => currHref,
});

const createDetailsButton = (pastCommits: string[]): Element | void => {
	if (pastCommits.length <= 2) {
		return;
	}

	return (
		<details
			className="details-reset details-overlay select-menu BtnGroup-parent d-inline-block position-relative tooltipped tooltipped-n"
			aria-label="Select additional histories"
		>
			<summary className="js-blob-dropdown-click select-menu-button btn-sm btn BtnGroup-item float-none px-2"/>
			<div className="SelectMenu right-0">
				<div className="SelectMenu-modal width-full">
					<div className="SelectMenu-list SelectMenu-list--borderless py-2">
						{pastCommits.slice(2).map((element, i) => {
							const item = (
								<div className="SelectMenu-item no-wrap text-normal f5">
									<div className="d-flex width-full gap-4">
										<div className="color-fg-default flex-auto">{i + 2} commits ago</div>
										<div className="color-fg-muted flex-shrink-0">{element.slice(0, 7)}</div>
									</div>
								</div>
							);

							delegate(item, '*', 'click', () => {
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
	);
};

const add = async (actionButtons: HTMLElement): Promise<void> => {
	const pastCommits = await getPastCommits(location.href);

	if (!pastCommits || pastCommits.length === 1) {
		return;
	}

	const button = (
		<div className="BtnGroup ml-1">
			<div className="BtnGroup-parent tooltipped tooltipped-n" aria-label="Goto previous file">
				{(() => {
					const button = (
						<div className="btn-sm BtnGroup-item btn">
							Previous
						</div>
					);

					delegate(button, '*', 'click', () => {
						const url = new GitHubURL(location.href);
						url.branch = pastCommits[1];
						location.href = url.toString();
					});

					return button;
				})()}
			</div>

			{pastCommits.length > 2 && createDetailsButton(pastCommits)}
		</div>
	);

	actionButtons.prepend(button);
};

async function init(signal: AbortSignal): Promise<false | void> {
	const historyOids = await getPastCommits(location.href);

	if (!historyOids) {
		return false;
	}

	observe(['#repos-sticky-header .react-blob-header-edit-and-raw-actions'], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	init,
});
