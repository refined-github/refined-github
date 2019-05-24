import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import * as icons from '../libs/icons';

interface Tag {
	name: string;
	commitResourcePath: string;
	commit: string;
}

async function getTags(after?: string): Promise<Tag[]> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const {repository} = await api.v4(`{
		repository(owner: "${ownerName}", name: "${repoName}") {
			refs(first: 100, refPrefix: "refs/tags/"${after ? `, after:"${after}"` : ''}) {
				pageInfo {
					hasNextPage
					endCursor
				}
				nodes {
					target {
						... on Tag {
							name
							commitResourcePath
						}
					}
				}
			}
		}
	}`);
	let tags: Tag[] = repository.refs.nodes.map((node: any) => node.target).filter((tag: Tag) => tag.name && tag.commitResourcePath).map((tag: Tag) => ({...tag, commit: tag.commitResourcePath.split('/')[4]}));
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
					<span className="ml-1">{targetTags.map(tags => tags.name).join(', ')}</span>
					<span className="ml-1">{targetTags.map((tags,i) => (
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
