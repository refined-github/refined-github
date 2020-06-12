
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

export default function createHEADLink(baseRepo: string): string {
	if (pageDetect.isRepoRoot() || !(pageDetect.isSingleFile() || pageDetect.isRepoTree())) {
		return '/' + baseRepo;
	}

	const [user, repository] = baseRepo.split('/');
	const url = new GitHubURL(location.href).assign({
		user,
		repository,
		branch: 'HEAD'
	});

	return url.pathname;
}

function init(): void {
	const forkSource = select<HTMLAnchorElement>('.fork-flag .text a')!;
	forkSource.pathname = createHEADLink(forkSource.textContent!);
}

void features.add({
	id: __filebasename,
	description: 'Redirects the source repository link of a fork to the same view in the source.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	init
});
