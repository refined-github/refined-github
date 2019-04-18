import select from 'select-dom';
import observeEl from './simplified-element-observer';

type CommitStatus = false | typeof SUCCESS | typeof FAILURE | typeof PENDING | typeof COMMIT_CHANGED;
type StatusListener = (status: CommitStatus) => void;

function getLastCommit() {
	return select.all('.timeline-commits .commit-id').pop()!.textContent;
}

export const SUCCESS = Symbol('Success');
export const FAILURE = Symbol('Failure');
export const PENDING = Symbol('Pending');
export const COMMIT_CHANGED = Symbol('Commit changed');

export function get(): CommitStatus {
	const commits = select.all('.commit-build-statuses > :first-child');
	const lastCommit = commits[commits.length - 1];
	if (lastCommit) {
		if (lastCommit.matches('.text-green')) {
			return SUCCESS;
		}

		if (lastCommit.matches('.text-red')) {
			return FAILURE;
		}

		return PENDING;
	}

	return false;
}

export function wait() {
	return new Promise(resolve => {
		addEventListener(function handler(newStatus: CommitStatus) {
			removeEventListener(handler);
			resolve(newStatus);
		});
	});
}

const observers = new WeakMap<StatusListener, MutationObserver>();

export function addEventListener(listener: StatusListener) {
	if (observers.has(listener)) {
		return;
	}

	let previousCommit = getLastCommit();
	let previousStatus = get();
	const filteredListener = () => {
		// Cancel submission if a new commit was pushed
		const newCommit = getLastCommit();
		if (newCommit !== previousCommit) {
			previousCommit = newCommit;
			listener(COMMIT_CHANGED);
		}

		// Ignore update if the status hasn't changed
		const newStatus = get();
		if (newStatus !== previousStatus) {
			previousStatus = newStatus;
			listener(newStatus);
		}
	};

	const observer = observeEl('.js-discussion', filteredListener, {
		childList: true,
		subtree: true
	})!;
	observers.set(listener, observer);
}

export function removeEventListener(listener: StatusListener) {
	observers.get(listener)!.disconnect();
}
