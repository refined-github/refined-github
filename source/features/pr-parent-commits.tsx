import React from 'dom-chef';
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import pluralize from '../helpers/pluralize';
import {getRepoGQL, getRepoURL} from '../github-helpers';

const getCommitParents = cache.function(async (commit: string): Promise<string[]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			object(expression: "${commit}") {
				... on Commit {
					parents(first: 10) {
						nodes {
							abbreviatedOid
						}
					}
				}
			}
		}
	`);

	return repository.object.parents.nodes.map((parent: AnyObject) => parent.abbreviatedOid);
}, {
	cacheKey: ([commit]) => 'pr-commit-parents:' + commit
});

async function init(): Promise<void> {
	const commitSha = location.pathname.split('/').pop()!;
	const parents = await getCommitParents(commitSha);
	const shaBlock = await elementReady('.sha-block');
	shaBlock!.before(
		<span className="sha-block ml-0">
			{pluralize(parents.length, '1 Parent ', '$$ Parents ')}
			{parents.map((parent, index) => (
				<>
					<a
						className="sha"
						data-hotkey={index === 0 ? 'p' : (index === 1 ? 'o' : '')}
						href={`/${getRepoURL()}/commit/${parent}`}
					>
						{parent}
					</a>
					{parents.length >= 2 && index < parents.length - 1 ? ' +   ' : ' '}
				</>
			))}
		</span>
	);
}

void features.add({
	id: __filebasename,
	description: 'Adds commit parents to PR commits.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/84607287-71fef980-ae7a-11ea-8d67-99f03f3c3af9.png'
}, {
	include: [
		pageDetect.isPRCommit
	],
	exclude: [
		// Forced pushed commit 404 ages
		() => document.title.startsWith('Commit range not found · Pull Request')
	],
	waitForDomReady: false,
	init
});
