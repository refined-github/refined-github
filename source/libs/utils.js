import select from 'select-dom';
import onetime from 'onetime';
import {isRepo, isPR, isIssue} from './page-detect';

export const getUsername = onetime(() => select('meta[name="user-login"]').getAttribute('content'));

export const getDiscussionNumber = () => (isPR() || isIssue()) && getCleanPathname().split('/')[3];

// Drops leading and trailing slash to avoid /\/?/ everywhere
export const getCleanPathname = () => location.pathname.replace(/^[/]|[/]$/g, '');

// Parses a repo's subpage, e.g.
// '/user/repo/issues/' -> 'issues'
// '/user/repo/' -> ''
// returns false if the path is not a repo
export const getRepoPath = () => {
	if (isRepo()) {
		return getCleanPathname().split('/').slice(2).join('/');
	}

	return false;
};

export const getRepoBranch = () => {
	const [type, branch] = getCleanPathname().split('/').slice(2);
	if (isRepo() && type === 'tree') {
		return branch;
	}

	return false;
};

export const getRepoURL = () => location.pathname.slice(1).split('/', 2).join('/');

export const getOwnerAndRepo = () => {
	const [, ownerName, repoName] = location.pathname.split('/', 3);
	return {ownerName, repoName};
};

export const groupBy = (iterable, grouper) => {
	const map = {};
	for (const item of iterable) {
		const key = grouper(item);
		map[key] = map[key] || [];
		map[key].push(item);
	}

	return map;
};

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
// Like lodash.zip
export const flatZip = (table, limit = Infinity) => {
	const maxColumns = Math.max(...table.map(row => row.length));
	const zipped = [];
	for (let col = 0; col < maxColumns; col++) {
		for (const row of table) {
			if (row[col]) {
				zipped.push(row[col]);
				if (zipped.length === limit) {
					return zipped;
				}
			}
		}
	}

	return zipped;
};

export const isMac = /Mac/.test(navigator.platform);

export const metaKey = isMac ? 'metaKey' : 'ctrlKey';
