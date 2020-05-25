import {getCurrentBranch} from '.';

interface Pathname {
	user: string;
	repository: string;
	route: string;
	branch: string;
	filePath: string;
	toString: () => string;
}

const timeStampRegex = /.*@{(\d{4}([.\-/ ])\d{2}\2\d{2}T\d\d:\d\d:\d\dZ)}/;
function isTimeStamp(part1: string): boolean {
	return timeStampRegex.test(decodeURIComponent(part1));
}

export default function parseRoute(pathname: string): Pathname {
	const [user, repository, route, ...next] = pathname.replace(/^\/|\/$/g, '').split('/');
	const branch = getCurrentBranch();
	next[0] = isTimeStamp(next[0]) ? branch + '/' : next[0];
	const parts = next.join('/');
	if (parts !== branch && !parts.startsWith(branch + '/')) {
		throw new Error('The branch of the current page must match the branch in the `pathname` parameter');
	}

	const filePath = parts.replace(branch, '').replace(/^\//, '');
	return {
		user,
		repository,
		route,
		branch,
		filePath,
		toString() {
			return `/${this.user}/${this.repository}/${this.route}/${this.branch}/${this.filePath}`.replace(/\/$/, '');
		}
	};
}
