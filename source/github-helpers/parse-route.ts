import {getCurrentBranch} from '.';

interface Pathname {
	user: string;
	repository: string;
	route: string;
	branch: string;
	filePath: string;
	toString: () => string;
}
export default function parseRoute(pathname: string): Pathname {
	const [user, repository, route, ...next] = pathname.replace(/^\/|\/$/g, '').split('/');
	const parts = next.join('/');
	const branch = getCurrentBranch();
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
