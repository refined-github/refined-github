import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {BookIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {buildRepoURL, getRepo} from '../github-helpers';

const getCacheKey = (): string => `changelog:${getRepo()!.nameWithOwner}`;

function parseFromDom(): string | false {
	return select('.js-navigation-item [title^="changelog." i]')?.textContent ?? false;
}

async function fetchFromApi(): Promise<string | false > {
	const {repository} = await api.v4(`
		repository() {
			object(expression: "HEAD:") {
				...on Tree {
					entries {
						name
					}
				}
			}
		}
	`);

	return repository.object.entries.find((file: {name: string}) => file.name.toLowerCase().startsWith('changelog.'))?.name ?? false;
}

const doesChangelogExist = cache.function(async () => pageDetect.isRepoHome() ? parseFromDom() : fetchFromApi(), {
	cacheKey: getCacheKey
});

async function init(): Promise<void | false> {
	// Always prefer the information in the DOM
	if (pageDetect.isRepoHome()) {
		await cache.delete(getCacheKey());
		void doesChangelogExist();
		return;
	}

	const changelog = await doesChangelogExist();
	if (!changelog) {
		return false;
	}

	const url = buildRepoURL('blob', 'HEAD', changelog);
	const tooltip = 'View the ' + changelog + ' file';
	(await elementReady('.subnav div', {waitForChildren: false}))!.after(
		<a className="btn ml-2 tooltipped tooltipped-s" aria-label={tooltip} href={url} style={{padding: '6px 16px'}} role="button">
			<BookIcon className="text-blue mr-2"/>
			<span>Changelog</span>
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isReleasesOrTags
	],
	awaitDomReady: false,
	init
}, {
	include: [
		pageDetect.isRepoHome
	],
	exclude: [
		pageDetect.isEmptyRepoRoot
	],
	init
});
