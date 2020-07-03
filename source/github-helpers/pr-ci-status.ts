import select from 'select-dom';

import observeElement from '../helpers/simplified-element-observer';

type CommitStatus = false | typeof SUCCESS | typeof FAILURE | typeof PENDING | typeof COMMIT_CHANGED;
type StatusListener = (status: CommitStatus) => void;

// `.TimelineItem--condensed` excludes unrelated references. See `deemphasize-unrelated-commit-references` feature
const commitSelector = '.js-commit.TimelineItem--condensed';

function getLastCommitReference(): string | null {
	return select.last(`${commitSelector} code`)!.textContent;
}

export const SUCCESS = Symbol('Success');
export const FAILURE = Symbol('Failure');
export const PENDING = Symbol('Pending');
export const COMMIT_CHANGED = Symbol('Commit changed');

export function get(): CommitStatus {
	// Excludes commit references. Sometimes commits don't have a status icon at all, yet
	const lastCommit = select.last(commitSelector);
	if (lastCommit) {
		if (lastCommit.querySelector('.octicon-check')) {
			return SUCCESS;
		}

		if (lastCommit.querySelector('.octicon-x')) {
			return FAILURE;
		}

		if (lastCommit.querySelector('.octicon-dot-fill')) {
			return PENDING;
		}
	}

	return false;
}

export async function wait(): Promise<CommitStatus> {
	return new Promise(resolve => {
		addEventListener(function handler(newStatus: CommitStatus) {
			removeEventListener(handler);
			resolve(newStatus);
		});
	});
}

const observers = new WeakMap<StatusListener, MutationObserver>();

export function addEventListener(listener: StatusListener): void {
	if (observers.has(listener)) {
		return;
	}

	let previousCommit = getLastCommitReference();
	let previousStatus = get();
	const filteredListener = (): void => {
		// Cancel submission if a new commit was pushed
		const newCommit = getLastCommitReference();
		if (newCommit !== previousCommit) {
			previousCommit = newCommit;
			listener(COMMIT_CHANGED);
			return;
		}

		// Ignore update if the status hasn't changed
		const newStatus = get();
		if (newStatus !== previousStatus) {
			previousStatus = newStatus;
			listener(newStatus);
		}
	};

	const observer = observeElement('.js-discussion', filteredListener, {
		childList: true,
		subtree: true
	})!;
	observers.set(listener, observer);
}

export function removeEventListener(listener: StatusListener): void {
	observers.get(listener)!.disconnect();
}
