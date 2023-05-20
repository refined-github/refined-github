import React from 'dom-chef';
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import pluralize from '../helpers/pluralize.js';

const getCommitChanges = cache.function('commit-changes', async (commit: string): Promise<[additions: number, deletions: number]> => {
	const {repository} = await api.v4(`
		query getCommitChanges($commit: String!) {
			repository(owner: $owner, name: $name) {
				object(expression: $commit) {
					... on Commit {
						additions
						deletions
					}
				}
			}
		}
	`, {
		variables: {
			commit,
		},
	});

	return [repository.object.additions, repository.object.deletions];
});

async function init(): Promise<void> {
	const commitSha = location.pathname.split('/').pop()!;
	const [additions, deletions] = await getCommitChanges(commitSha);
	const tooltip = pluralize(additions + deletions, '1 line changed', '$$ lines changed');
	const diffstat = await elementReady('.diffstat', {waitForChildren: false});
	diffstat!.replaceWith(
		<span className="ml-2 diffstat tooltipped tooltipped-s" aria-label={tooltip}>
			<span className="color-fg-success">+{additions}</span>{' '}
			<span className="color-fg-danger">−{deletions}</span>{' '}
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
			<span className="diffstat-block-neutral"/>
		</span>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
