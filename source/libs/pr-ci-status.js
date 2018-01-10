import select from 'select-dom';
import debounce from 'debounce-fn';

function getLastCommit() {
	return select.all('.timeline-commits .commit-id').pop().textContent;
}

export const SUCCESS = Symbol('Success');
export const FAILURE = Symbol('Failure');
export const PENDING = Symbol('Pending');
export const COMMIT_CHANGED = Symbol('Commit changed');

export function get() {
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
		const messenger = select('.js-discussion');
		const acceptedCommit = getLastCommit();

		const updatesHandler = debounce(() => {
			// Cancel submission if a new commit was pushed
			if (getLastCommit() !== acceptedCommit) {
				messenger.removeEventListener('socket:message', updatesHandler);
				return resolve(COMMIT_CHANGED);
			}

			// Ignore update if the status hasn't changed
			const status = get();
			if (status !== PENDING) {
				messenger.removeEventListener('socket:message', updatesHandler);
				resolve(status);
			}

			// Wait a bit because the DOM might be updated later
		}, {wait: 500});

		messenger.addEventListener('socket:message', updatesHandler);
	});
}
