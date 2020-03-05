import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL, getRepoURL} from '../libs/utils';
import React from 'dom-chef';
import elementReady from 'element-ready';

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
	maxAge: 10,
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const commitSha = (await elementReady('.sha.user-select-contain'))!.textContent!;
	const [additions, deletions] = await getCommitChanges(commitSha);
	const totalLinesChanged = additions + deletions;
	const totalLinesChangedText = `${totalLinesChanged} ${totalLinesChanged > 1 ? 'Lines Changed' : 'Line Change'}`;
	select('.diffstat')!.replaceWith(
		<span className="ml-2 diffstat tooltipped tooltipped-s" aria-label={totalLinesChangedText}>
			<span className="text-green">+{additions}</span>
			<span className="ml-1 mr-2 text-red">−{deletions}</span>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
		</span>);
}

features.add({
	id: __featureName__,
	description: 'Add line changes on pr commits',
	screenshot: 'https://user-images.githubusercontent.com/16872793/75835025-cb3f9300-5d8b-11ea-8126-d8778c71e467.png',
	include: [
		features.isPRCommit
	],
	load: features.nowAndOnAjaxedPages,
	init
});
