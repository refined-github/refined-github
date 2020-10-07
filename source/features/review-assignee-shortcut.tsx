import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import elementReady from 'element-ready';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

import './review-assignee-shortcut.css';
import {getConversationNumber, getRepoGQL} from '../github-helpers';
import * as api from '../github-helpers/api';

function diff<T>(a: Set<T>, b: Set<T>): Set<T> {
	return new Set([...a].filter(element => !b.has(element)));
}

interface PrInfo {
	readonly id: string;
	readonly author: string;
	readonly assignees: Set<string>;
	readonly pendingReviewers: Set<string>;
}

async function getPrInfo(): Promise<PrInfo> {
	interface User {
		id: string;
	}
	interface Response {
		repository: {
			pullRequest: {
				id: string;
				author: User;
				assignees: {nodes: User[]};
				reviewRequests: {nodes: Array<{requestedReviewer: User}>};
			};
		};
	}
	const {repository} = await api.v4(`
                repository(${getRepoGQL()}) {
                  pullRequest(number: ${getConversationNumber()!}) {
                    id
                    author {
                      ... on User {
                        id
                      }
                    }
                    assignees(first: 25) {
                      nodes {
                        id
                      }
                    }
                    reviewRequests(first: 25) {
                      nodes {
                        requestedReviewer {
                          ... on User {
                            id
                          }
                        }
                      }
                    }
                  }
                }
	`) as Response;
	const id = repository.pullRequest.id;
	const author = repository.pullRequest.author.id;
	const assignees = new Set(repository.pullRequest.assignees.nodes.map(({id}) => id));
	const pendingReviewers = new Set(repository.pullRequest.reviewRequests.nodes.map(({requestedReviewer: {id}}) => id));
	return {id, author, assignees, pendingReviewers};
}

async function init(): Promise<void | false> {
	const selectMenu = await elementReady('#assignees-select-menu');
	if (!selectMenu || !selectMenu.parentElement) {
		return false;
	}

	selectMenu.parentElement.insertBefore(<p><a className="rgh-juggle-link" onClick={handleJuggling}>Juggle</a></p>, selectMenu);
}

async function attentionSetDiff(): Promise<AttentionSetDiff> {
	const {id, assignees, pendingReviewers, author} = await getPrInfo();
	console.log(author, pendingReviewers, assignees);
	const result = new AttentionSetDiff(id);
	if (pendingReviewers.size > 0) {
		result.toAdd = diff(pendingReviewers, assignees);
		result.toRemove = diff(assignees, pendingReviewers);
	} else {
		const authorSet = new Set([author]);
		result.toAdd = diff(authorSet, assignees);
		result.toRemove = diff(assignees, authorSet);
	}

	return result;
}

class AttentionSetDiff {
	toAdd = new Set<string>();
	toRemove = new Set<string>();

	constructor(public pullRequestId: string) {}

	isEmpty(): boolean {
		return this.toRemove.size === 0 && this.toAdd.size === 0;
	}
}

async function handleJuggling(): Promise<void> {
	const diff = await attentionSetDiff();
	if (diff.isEmpty()) {
		return;
	}

	const toAdd = JSON.stringify([...diff.toAdd]);
	const toRemove = JSON.stringify([...diff.toRemove]);
	try {
		await api.v4mutation(`
                                    addAssigneesToAssignable(input: {assignableId: "${diff.pullRequestId}", assigneeIds: ${toAdd}}) {
                                      clientMutationId
                                    }
                                    removeAssigneesFromAssignable(input: {assignableId: "${diff.pullRequestId}", assigneeIds: ${toRemove}}) {
                                      clientMutationId
                                    }
                       `);
	} catch (error) {
		console.warn(error);
	}
}

void features.add({
	id: __filebasename,
	description: 'Simplify the GitHub interface and adds useful features.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58238638-3cbcd080-7d7a-11e9-80f6-be6c0520cfed.jpg'
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => void onReplacedElement('#assignees-select-menu', init)
	],
	awaitDomReady: false,
	init: () => void init()
});
