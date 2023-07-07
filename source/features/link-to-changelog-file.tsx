import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import select from 'select-dom';
import {BookIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {wrapAll} from '../helpers/dom-utils.js';
import {buildRepoURL, getRepo} from '../github-helpers/index.js';

type FileType = {
	name: string;
	type: string;
};

const changelogFiles = /^(changelog|news|changes|history|release|whatsnew)(\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee|txt|rst))?$/i;
function findChangelogName(files: string[]): string | false {
	return files.find(name => changelogFiles.test(name)) ?? false;
}

function parseFromDom(): false {
	const files = select.all('[aria-labelledby="files"] .js-navigation-open[href*="/blob/"').map(file => file.title);
	void changelogName.applyOverride(
		[findChangelogName(files) as string] /* TODO: Type mistake */,
		getRepo()!.nameWithOwner,
	);
	return false;
}

const changelogName = new CachedFunction('changelog', {
	async updater(nameWithOwner: string): Promise<string | false> {
		const [owner, name] = nameWithOwner.split('/');
		const {repository} = await api.v4(`
		repository() {
			object(expression: "HEAD:") {
				...on Tree {
					entries {
						name
						type
					}
				}
			}
		}
	`, {
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

	const changelogButton = (
		<a
			className={'tooltipped tooltipped-n btn ml-3' + (pageDetect.isEnterprise() ? '' : ' flex-self-start')}
			aria-label={`View the ${changelog} file`}
			href={buildRepoURL('blob', 'HEAD', changelog)}
			style={pageDetect.isEnterprise() ? {padding: '6px 16px'} : {}}
			role="button"
		>
			<BookIcon className="color-fg-accent mr-2"/>
			<span>Changelog</span>
		</a>
	);

	const releasesOrTagsNavbarSelector = [
		'nav[aria-label^="Releases and Tags"]', // Release list
		'.subnav-links', // Tag list
	].join(',');

	const navbar = (await elementReady(releasesOrTagsNavbarSelector, {waitForChildren: false}))!;
	navbar.classList.remove('flex-1');
	wrapAll([navbar, changelogButton], <div className="d-flex flex-justify-start flex-1"/>);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	exclude: [
		pageDetect.isSingleTag,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isRepoHome,
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true, // Does not affect current visit
	init: parseFromDom,
});

/*

Test URLs:

- CHANGELOG.md: https://github.com/nodeca/js-yaml/releases/tag/4.0.0)
- CHANGELOG.rst: https://github.com/pyca/cryptography/releases)
- CHANGES: https://github.com/sphinx-doc/sphinx/releases)
- news: https://github.com/pypa/pip/releases)
- HISTORY.md: https://github.com/psf/requests/releases)

*/
