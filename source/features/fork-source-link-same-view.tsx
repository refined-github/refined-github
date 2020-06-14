import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import {getRepoURL} from '../github-helpers';

const checkIfFileExists = async (url: GitHubURL) => {
	const {repository} = await api.v4(`
		repository(owner: "${url.user}", name: "${url.repository}") {
			file: object(expression: "${url.branch}:${url.filePath}") {
				... on Blob {
					id
				}
			}
		}
	`);

	if (!repository.file) {
		const source = select<HTMLAnchorElement>(`[href$="${url.pathname}" i]`)!;
		source.pathname = '/' + source.textContent!.trim();
	}
};

// eslint-disable-next-line import/prefer-default-export
export function createHEADLink(baseRepo: string): string {
	if (pageDetect.isRepoRoot() || !(pageDetect.isSingleFile() || pageDetect.isRepoTree() || // There will be no change to the link
		baseRepo.toLowerCase() === getRepoURL()) // Your there already
	) {
		return '/' + baseRepo;
	}

	const [user, repository] = baseRepo.split('/');
	const url = new GitHubURL(location.href).assign({
		user,
		repository,
		branch: 'HEAD'
	});

	if (pageDetect.isSingleFile()) {
		// If the file does not exists update the link, but dont await it.
		void checkIfFileExists(url);
	}

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
