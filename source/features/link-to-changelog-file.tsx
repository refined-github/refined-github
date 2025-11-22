import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoURL, getRepo} from '../github-helpers/index.js';
import GetFilesOnRoot from './link-to-changelog-file.gql';

type FileType = {
	name: string;
	type: string;
};

const changelogFiles = /^(?:changelog|news|changes|history|release|whatsnew)(?:\.(?:mdx?|mkdn?|mdwn|mdown|markdown|litcoffee|txt|rst))?$/i;
function findChangelogName(files: string[]): string | false {
	return files.find(name => changelogFiles.test(name)) ?? false;
}

const changelogName = new CachedFunction('changelog', {
	async updater(nameWithOwner: string): Promise<string | false> {
		const [owner, name] = nameWithOwner.split('/');
		const {repository} = await api.v4(GetFilesOnRoot, {
			variables: {name, owner},
		});

		const files: string[] = [];
		for (const entry of repository.object.entries as FileType[]) {
			if (entry.type === 'blob') {
				files.push(entry.name);
			}
		}

		return findChangelogName(files);
	},
});

async function init(): Promise<void | false> {
	const changelog = await changelogName.get(getRepo()!.nameWithOwner);
	if (!changelog) {
		return false;
	}

	const releasesOrTagsNavbarSelector = [
		'nav[aria-label^="Releases and Tags"]', // Release list
		'.subnav-links', // Tag list
	];

	const navbar = await elementReady(releasesOrTagsNavbarSelector);
	navbar!.append(
		<a
			className="subnav-item tooltipped tooltipped-n"
			aria-label={`View the ${changelog} file`}
			href={buildRepoURL('blob', 'HEAD', changelog)}
		>
			<span>Changelog</span>
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	exclude: [
		pageDetect.isSingleReleaseOrTag,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

- CHANGELOG.md: https://github.com/nodeca/js-yaml/releases/tag/4.0.0)
- CHANGELOG.rst: https://github.com/pyca/cryptography/releases)
- CHANGES: https://github.com/sphinx-doc/sphinx/releases)
- news: https://github.com/pypa/pip/releases)
- HISTORY.md: https://github.com/psf/requests/releases)

*/
