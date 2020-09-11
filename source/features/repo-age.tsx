import twas from 'twas';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import RepoIcon from 'octicon/repo.svg';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL, getRepoGQL} from '../github-helpers';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

const getRepoAge = async (commitSha: string, commitsCount: number): Promise<[committedDate: string, resourcePath: string]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			defaultBranchRef {
				target {
					... on Commit {
						history(first: 5, after: "${commitSha} ${commitsCount - Math.min(6, commitsCount)}") {
							nodes {
								committedDate
								resourcePath
							}
						}
					}
				}
			}
		}
	`);

	const {committedDate, resourcePath} = repository.defaultBranchRef.target.history.nodes
		.reverse()
		// Filter out any invalid commit dates #3185
		.find((commit: AnyObject) => new Date(commit.committedDate).getFullYear() > 1970);

	return [committedDate, resourcePath];
};

const getFirstCommit = cache.function(async (): Promise<[committedDate: string, resourcePath: string]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			defaultBranchRef {
				target {
					... on Commit {
						oid
						committedDate
						resourcePath
						history {
							totalCount
						}
					}
				}
			}
		}
	`);

	const {oid: commitSha, history, committedDate, resourcePath} = repository.defaultBranchRef.target;
	const commitsCount = history.totalCount;
	if (commitsCount === 1) {
		return [committedDate, resourcePath];
	}

	return getRepoAge(commitSha, commitsCount);
}, {
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const [firstCommitDate, firstCommitHref] = await getFirstCommit()!;
	const date = new Date(firstCommitDate);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	// TODO: simplify selector after https://github.com/sindresorhus/element-ready/issues/29
	const secondSidebarSection = await elementReady('.repository-content .BorderGrid-row + .BorderGrid-row');
	if (secondSidebarSection) {
		const sidebarAboutSection = secondSidebarSection.previousElementSibling!;
		select('.BorderGrid-cell', sidebarAboutSection)!.append(
			<h3 className="sr-only">Repository age</h3>,
			<div className="mt-3">
				<a href={firstCommitHref} className="muted-link" title={`First commit dated ${dateFormatter.format(date)}`}>
					<RepoIcon className="mr-2"/> {value} {unit} old
				</a>
			</div>
		);

		return;
	}

	// Pre "Repository refresh" layout
	const element = (
		<li className="text-gray" title={`First commit dated ${dateFormatter.format(date)}`}>
			<a href={firstCommitHref}>
				<RepoIcon/> <span className="num text-emphasized">{value}</span> {unit} old
			</a>
		</li>
	);

	const license = select('.numbers-summary .octicon-law');
	if (license) {
		license.closest('li')!.before(element);
	} else {
		select('.numbers-summary')!.append(element);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds the age of the repository to the stats/numbers bar',
	screenshot: 'https://user-images.githubusercontent.com/3848317/69256318-95e6af00-0bb9-11ea-84c8-c6996d39da80.png'
}, {
	include: [
		pageDetect.isRepoRoot
	],
	exclude: [
		() => select.exists('[aria-label="Cannot fork because repository is empty."]')
	],
	waitForDomReady: false,
	init
});
