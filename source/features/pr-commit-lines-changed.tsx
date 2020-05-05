import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getRepoGQL, pluralize} from '../libs/utils';

const getCommitChanges = cache.function(async (commit: string): Promise<[number, number]> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			object(expression: "${commit}") {
				... on Commit {
					additions
					deletions
				}
			}
		}
	`);

	return [repository.object.additions, repository.object.deletions];
}, {
	cacheKey: ([commit]) => 'commit-changes:' + commit
});

async function init(): Promise<void> {
	const commitSha = (await elementReady('.sha.user-select-contain'))!.textContent!;
	const [additions, deletions] = await getCommitChanges(commitSha);
	const tooltip = pluralize(additions + deletions, '1 line changed', '$$ lines changed');
	select('.diffstat')!.replaceWith(
		<span className="ml-2 diffstat tooltipped tooltipped-s" aria-label={tooltip}>
			<span className="text-green">+{additions}</span>{' '}
			<span className="text-red">−{deletions}</span>{' '}
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
		</span>
	);
}

features.add({
	id: __filebasename,
	description: 'Adds diff stats on PR commits.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/76107253-48deeb00-5fa6-11ea-9931-721cde553bdf.png'
}, {
	include: [
		pageDetect.isPRCommit
	],
	waitForDomReady: false,
	init
});
