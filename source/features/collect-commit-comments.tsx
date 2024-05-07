import './collect-commit-comments.css';
import * as pageDetect from 'github-url-detection';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import React from 'dom-chef';
import api from '../github-helpers/api.js';
import GetCommentsFromCommit from './collect-commit-comments.gql';
import { CachedFunction } from 'webext-storage-cache';

const getCommitComments = new CachedFunction('get-comments', {
	async updater(commit: string): Promise<any> {
		const { repository: { object: { comments } } } = await api.v4(GetCommentsFromCommit, {
			variables: {
				commit
			}
		});

		return comments;
	}
});

async function append(element: HTMLElement): Promise<void> {
	const commitSha = location.pathname.split('/').pop()!;
	const comments = await getCommitComments.get(commitSha);
	console.log(comments.nodes);
	for (let commentsKey in comments.nodes) {
		const comment = comments.nodes[commentsKey];
		if (comment.position === null) continue;
		const author = comment.author;
		const body = comment.bodyHTML;
		const url = comment.url;
		const pos = comment.position;
		const path = comment.path;

		element.append(
			<div className={'js-comment-container TimelineItem d-block'}>
				<a className={'avatar-parent-child TimelineItem-avatar d-none d-md-block'}>
					<img className={'avatar rounded-2 avatar-user'} src={author.avatarUrl + '?s=80&v=4'} alt={author.login}
							 width={40} height={40} />
				</a>
				<div
					className={'timeline-comment-group js-minimizable-comment-group js-targetable-element my-0 comment previewable-edit js-task-list-container js-comment timeline-comment timeline-comment--caret ml-n3 js-minimize-container unminimized-comment'}>
					<div className={'rgh-comment-header clearfix d-flex'}>
						<div>
							<b className={'rgh-comment-header-bolt'}>{author.login}</b> commented on <a href={url}>line {pos}</a> in file {path}</div>
					</div>
					<div
						className={'comment-body markdown-body js-comment-body soft-wrap css-overflow-wrap-anywhere user-select-contain d-block'}>
						<div dangerouslySetInnerHTML={{ __html: body }}></div>
					</div>
				</div>
			</div>
		);
	}


}

async function init(signal: AbortSignal): Promise<void> {
	observe('div#comments', append, { signal });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommit
	],
	init
});

