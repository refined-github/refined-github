import {$, lastElement} from 'select-dom';

import api from './api.js';
import {prCommit, prCommitStatusIcon} from './selectors.js';

export const SUCCESS = Symbol('Success');
export const FAILURE = Symbol('Failure');
export const PENDING = Symbol('Pending');
export type CommitStatus = false | typeof SUCCESS | typeof FAILURE | typeof PENDING;

export function getLastCommitReference(): string {
	return lastElement(`${prCommit} code`)!.textContent;
}

export function getLastCommitStatus(): CommitStatus {
	// Select the last commit first, THEN pick the icon, otherwise it might pick non-last commit while the CI is starting up
	const lastCommit = lastElement(prCommit)!;
	const lastCommitStatusIcon = $(prCommitStatusIcon, lastCommit);

	// Some commits don't have a CI status icon at all
	if (lastCommitStatusIcon) {
		if (lastCommitStatusIcon.classList.contains('octicon-check')) {
			return SUCCESS;
		}

		if (lastCommitStatusIcon.classList.contains('octicon-x')) {
			return FAILURE;
		}

		if (lastCommitStatusIcon.classList.contains('octicon-dot-fill')) {
			return PENDING;
		}
	}

	return false;
}

export async function getCommitStatus(commitSha: string): Promise<CommitStatus> {
	const {repository} = await api.v4uncached(`
		query getCommitStatus($owner: String!, $name: String!, $commitSha: GitObjectID!) {
			repository(owner: $owner, name: $name) {
				object(expression: $commitSha) {
					... on Commit {
						checkSuites(first: 100) {
							nodes {
								checkRuns { totalCount }
								status
								conclusion
							}
						}
					}
				}
			}
		}
	`, {variables: {commitSha}});

	if (repository.object.checkSuites.nodes === 0) {
		return false; // The commit doesn't have any CI checks associated to it
	}

	for (const {checkRuns, status, conclusion} of repository.object.checkSuites.nodes) {
		// Check suites with no runs will always have a status of "QUEUED" (e.g. Dependabot when it's disabled on the repo)
		if (checkRuns.totalCount === 0) {
			continue;
		}

		if (status !== 'COMPLETED') {
			return PENDING;
		}

		if (conclusion !== 'SUCCESS' && conclusion !== 'NEUTRAL' && conclusion !== 'SKIPPED') {
			return FAILURE;
		}
	}

	return SUCCESS;
}
