import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {BookIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {wrapAll} from '../helpers/dom-utils';
import {buildRepoURL, getRepo} from '../github-helpers';

interface FileType {
	name: string;
	type: string;
}

const getCacheKey = (): string => `changelog:${getRepo()!.nameWithOwner}`;

const changelogFiles = /^(changelog|news|changes|history|release|whatsnew)(\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee|txt|rst))?$/i;
function findChangelogName(files: string[]): string | false {
	return files.find(name => changelogFiles.test(name)) ?? false;
}

function parseFromDom(): false {
	const files = select.all('[aria-labelledby="files"] .js-navigation-open[href*="/blob/"').map(file => file.title);
	void cache.set(getCacheKey(), findChangelogName(files));
	return false;
}

const getChangelogName = cache.function(async (): Promise<string | false> => {
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
	`);

	const files: string[] = [];
	for (const entry of repository.object.entries as FileType[]) {
		if (entry.type === 'blob') {
			files.push(entry.name);
		}
	}

	return findChangelogName(files);
}, {
	cacheKey: getCacheKey,
});

// eslint-disable-next-line import/prefer-default-export
export const releasesOrTagsNavbarSelector = [
	'nav[aria-label^="Releases and Tags"]', // Release list
	'.subnav-links', // Tag list
].join(',');

async function init(): Promise<void | false> {
	const changelog = await getChangelogName();
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
			<BookIcon className="color-text-link color-fg-accent mr-2"/>
			<span>Changelog</span>
		</a>
	);

	if (pageDetect.isEnterprise()) {
		(await elementReady('.subnav div', {waitForChildren: false}))!.after(changelogButton);
	} else {
		// Releases UI refresh #4902
		const navbar = (await elementReady(releasesOrTagsNavbarSelector, {waitForChildren: false}))!;
		navbar.classList.remove('flex-1');
		wrapAll([navbar, changelogButton], <div className="d-flex flex-justify-start flex-1"/>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	exclude: [
		() => !pageDetect.isEnterprise() && pageDetect.isSingleTag(),
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isRepoHome,
	],
	init: parseFromDom,
});
