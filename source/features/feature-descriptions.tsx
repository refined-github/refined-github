import React from 'dom-chef';
import domify from 'doma';
import elementReady from 'element-ready';

import features from '.';
import * as api from '../github-helpers/api';
import {wrapAll} from '../helpers/dom-utils';
import GitHubURL from '../github-helpers/github-url';
import parseBackticks from '../github-helpers/parse-backticks';

interface Commit {
	messageHeadline: string;
	messageHeadlineHTML: string;
	commitUrl: string;
	committedDate: string;
}

const getFeatureHistory = async (fileName: string): Promise<Commit[]> => {
	const {repository} = await api.v4(`
		repository() {
			defaultBranchRef {
				target {
					...on Commit {
						history(first:100, path: "source/features/${fileName}") {
							nodes {
								messageHeadline
								messageHeadlineHTML
								commitUrl
								committedDate
							}
						}
					}
				}
			}
		}
	`);
	return repository.defaultBranchRef.target.history.nodes;
};

function getCommitUrl(commit: Commit): string {
	const [, pullRequestUrl] = /<a[^>]+href="([^"]+)">/.exec(commit.messageHeadlineHTML) ?? [];
	return pullRequestUrl ?? commit.commitUrl;
}

async function getHistoryDropdown(featureName: string): Promise<Element> {
	let history = await getFeatureHistory(featureName + '.tsx');

	if (history.length === 0) {
		// Feature might be CSS-only
		history = await getFeatureHistory(featureName + '.css');
	}

	const filteredHistory = history.filter((commit: Commit) => !/^Meta|^Document|^Readme|^Lint|^Update.+dependencies/.test(commit.messageHeadline));
	const skippedCommitsCount = history.length - filteredHistory.length;

	const historyUrl = new GitHubURL(location.href);
	historyUrl.assign({route: 'commits'});

	return (
		<details className="dropdown details-reset details-overlay d-inline-block">
			<summary className="text-gray d-inline" aria-haspopup="true">
				Feature history
				<div className="dropdown-caret ml-1"/>
			</summary>

			<div className="dropdown-menu dropdown-menu-s" style={{width: 400}}>
				<ul className="overflow-y-auto" style={{maxHeight: '60vh'}}>
					{filteredHistory.map(commit => (
						<li>
							<a className="dropdown-item" href={getCommitUrl(commit)} title={commit.messageHeadline}>
								{parseBackticks(commit.messageHeadline)}
								<div className="text-small">
									<relative-time datetime={commit.committedDate}/>
								</div>
							</a>
						</li>
					))}
					{skippedCommitsCount > 0 && (
						<>
							<li className="dropdown-divider" role="separator"/>
							<li>
								<a className="dropdown-item" href={String(historyUrl)}>
									View full history (+{skippedCommitsCount} commits)
								</a>
							</li>
						</>
					)}
				</ul>
			</div>
		</details>
	);
}

function getConversationsLink(featureName: string): Element {
	const searchParams = new URLSearchParams({
		q: `"${featureName}" sort:updated-desc`
	});

	const searchUrl = new URL('https://github.com/sindresorhus/refined-github/issues');
	searchUrl.search = String(searchParams);

	return <a className="ml-3" href={String(searchUrl)}>Conversations</a>;
}

async function init(): Promise<void | false> {
	const [, currentFeature] = /features\/([^.]+)/.exec(location.pathname)!;
	const {id, description, screenshot} = __featuresMeta__.find(feature => feature.id === currentFeature) ?? {};
	if (!description) {
		return false;
	}

	const descriptionElement = domify.one(description)!;
	descriptionElement.classList.add('text-bold');

	const commitInfoBox = (await elementReady('.Box-header--blue.Details'))!.parentElement!;
	commitInfoBox.classList.add('width-fit', 'flex-auto');
	commitInfoBox.classList.remove('mb-3');

	const featureInfoBox = (
		<div className="Box" style={{flex: '1 0 360px'}}>
			<div className="Box-row d-flex">
				{screenshot && id !== __filebasename &&
					<a href={screenshot}>
						<img
							src={screenshot}
							className="d-block border"
							height="100"
							width="100"
							style={{objectFit: 'cover'}}/>
					</a>}
				<div className="ml-3 flex-auto">
					{descriptionElement}
					{await getHistoryDropdown(id!)}
					{getConversationsLink(id!)}
				</div>
			</div>
		</div>
	);

	wrapAll([commitInfoBox, featureInfoBox], <div className="d-flex flex-wrap" style={{gap: 16}}/>);
}

void features.add(__filebasename, {
	include: [
		() => /refined-github\/blob\/.+?\/source\/features\/[\w.-]+$/.test(location.pathname)
	],
	awaitDomReady: false,
	init
});
