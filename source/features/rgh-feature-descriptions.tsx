import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';

import features from '.';
import * as api from '../github-helpers/api';
import {wrapAll} from '../helpers/dom-utils';
import parseBackticks from '../github-helpers/parse-backticks';

interface Commit {
	messageHeadline: string;
	messageHeadlineHTML: string;
	commitUrl: string;
	committedDate: string;
}

const getFeatureHistory = cache.function(async (fileName: string): Promise<Commit[]> => {
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

	// From https://github.com/notlmn/release-with-changelog/blob/5c804153ef8227047cf9bf373a704791aa3ee755/generate-release-notes.js#L6
	const excludePreset = /^meta|^document|^lint|^refactor|readme|dependencies|^v?\d+\.\d+\.\d+/i;

	return repository.defaultBranchRef.target.history.nodes.filter(
		(commit: Commit) => !excludePreset.test(commit.messageHeadline)
	);
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: ([fileName]): string => __filebasename + ':' + fileName
});

function getCommitUrl(commit: Commit): string {
	const [, pullRequestUrl] = /<a[^>]+href="([^"]+)">/.exec(commit.messageHeadlineHTML) ?? [];
	return pullRequestUrl ?? commit.commitUrl;
}

async function getHistoryDropdown(featureName: string): Promise<Element | void> {
	const history = await getFeatureHistory(featureName + '.tsx');
	if (history.length === 0) {
		return;
	}

	return (
		<details className="details-reset details-overlay d-inline-block ml-3 position-relative">
			<summary className="text-gray d-inline" aria-haspopup="true">
				Feature history
				<div className="dropdown-caret ml-1"/>
			</summary>
			<details-menu className="SelectMenu right-0 ws-normal" role="menu">
				<div className="SelectMenu-modal">
					<div className="SelectMenu-list">
						{history.map(commit => (
							<a
								className="SelectMenu-item d-block"
								role="menuitem"
								href={getCommitUrl(commit)}
								title={commit.messageHeadline}
							>
								<h5>{parseBackticks(commit.messageHeadline)}</h5>
								<relative-time className="text-gray" datetime={commit.committedDate}/>
							</a>
						))}
					</div>
				</div>
			</details-menu>
		</details>
	);
}

async function init(): Promise<void | false> {
	const [, currentFeature] = /features\/([^.]+)/.exec(location.pathname)!;
	const feature = __featuresMeta__.find(feature => feature.id === currentFeature);
	if (!feature) {
		return false;
	}

	const conversationsUrl = '/sindresorhus/refined-github/issues?q=' + encodeURIComponent(`"${feature.id}" sort:updated-desc`);

	const commitInfoBox = (await elementReady('.Box-header--blue.Details, include-fragment.commit-loader'))!.parentElement!;
	commitInfoBox.classList.add('width-fit', 'min-width-0', 'flex-auto', 'mb-lg-0', 'mr-lg-3');
	commitInfoBox.classList.remove('flex-shrink-0');

	const featureInfoBox = (
		<div className="Box" style={{flex: '0 1 544px'}}>
			<div className="Box-row d-flex height-full">
				{feature.screenshot && (
					<a href={feature.screenshot} className="flex-self-center">
						<img
							src={feature.screenshot}
							className="d-block border"
							style={{
								maxHeight: 100,
								maxWidth: 150
							}}/>
					</a>
				)}
				<div className={'flex-auto' + (feature.screenshot ? ' ml-3' : '')}>
					{ /* eslint-disable-next-line react/no-danger */ }
					<div dangerouslySetInnerHTML={{__html: feature.description}} className="text-bold"/>
					<div className="no-wrap">
						<a href={conversationsUrl}>Conversations</a>
					</div>
				</div>
			</div>
		</div>
	);

	wrapAll([commitInfoBox, featureInfoBox], <div className="d-lg-flex"/>);

	const historyDropdown = await getHistoryDropdown(feature.id);
	if (historyDropdown) {
		select('.no-wrap', featureInfoBox)!.append(historyDropdown);
	}
}

void features.add(__filebasename, {
	include: [
		() => /refined-github\/blob\/.+?\/source\/features\/[\w.-]+$/.test(location.pathname)
	],
	awaitDomReady: false,
	init
});
