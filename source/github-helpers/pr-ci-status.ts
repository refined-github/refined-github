import select from 'select-dom';

import * as api from './api';

export const SUCCESS = Symbol('Success');
export const FAILURE = Symbol('Failure');
export const PENDING = Symbol('Pending');
export type CommitStatus = false | typeof SUCCESS | typeof FAILURE | typeof PENDING;

export const commitSelector = '[data-test-selector="pr-timeline-commits-list"] .TimelineItem';

// `summary` is needed because the details dropdown contains the list of check runs, each with its status icon
export const commitStatusIconSelector = 'details.commit-build-statuses summary .octicon';

export function getLastCommitReference(): string | undefined {
	return select.last(`${commitSelector} code`)!.textContent ?? undefined;
}

export function getLastCommitStatus(): CommitStatus {
	const lastCommit = select.last(commitSelector)!;
	const lastCommitStatusIcon = lastCommit.querySelector(commitStatusIconSelector);

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
	const {commit} = await api.v4repository(`
		commit: object(expression: "${commitSha}") {
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
		# Cache buster: ${Date.now()}
	`);

	if (commit.checkSuites.nodes === 0) {
		return false; // The commit doesn't have any CI checks associated to it
	}

	for (const {checkRuns, status, conclusion} of commit.checkSuites.nodes) {
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
