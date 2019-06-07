import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import * as icons from '../libs/icons';

interface Tag {
	name: string;
	commit: string;
}

async function getTags(after?: string): Promise<Tag[]> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const {repository} = await api.v4(`{
		repository(owner: "${ownerName}", name: "${repoName}") {
			refs(
				first: 100,
				refPrefix: "refs/tags/",
				orderBy: {
					field: TAG_COMMIT_DATE,
					direction: DESC
				}
				${after ? `, after: "${after}"` : ''}
			) {
				pageInfo {
					hasNextPage
					endCursor
				}
				nodes {
					name
					target {
						commitResourcePath
					}
				}
			}
		}
	}`);
	let tags: Tag[] = repository.refs.nodes.map((node: any) => ({
		name: node.name,
		commit: node.target.commitResourcePath.split('/')[4]
	}));
	if (repository.refs.pageInfo.hasNextPage) {
		tags = tags.concat(await getTags(repository.refs.pageInfo.endCursor));
	}

	return tags;
}

async function init(): Promise<void | false> {
	const tags = await getTags();
	for (const commit of select.all('li.commit')) {
		const targetCommit = (commit.dataset.channel as string).split(':')[3];
		const targetTags = tags.filter(tag => tag.commit === targetCommit);
		if (targetTags.length > 0) {
			select('.commit-meta', commit)!.append(
				<div className="ml-2">
					{icons.tag()}
					<span className="ml-1">{targetTags.map((tags, i) => (
						<>
							<a href={`/${getRepoURL()}/releases/${tags.name}`}>{tags.name}</a>
							{(i + 1) === targetTags.length ? '' : ', '}
						</>
					))}</span>
				</div>
			);
		}
	}
}

features.add({
	id: 'add-tag-to-commits',
	description: 'Display the corresponding tags next to commits',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
