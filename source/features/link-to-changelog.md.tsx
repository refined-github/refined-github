import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {FileIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {buildRepoURL, getRepo} from '../github-helpers';

const getCacheKey = (): string => `changelog:${getRepo()!.nameWithOwner}`;

function parseFromDom(): string | false {
	return select('.js-navigation-item [title="changelog.md" i]')?.textContent ?? false;
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

	return repository.object.entries.find((file: {name: string}) => /changelog\.md/i.exec(file.name))?.name ?? false;
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
	select('.details-reset.Details-element')!.before(
		<a className="btn btn-sm btn-invisible mt-2 p-0" href={url} type="button">
			<FileIcon/>
			<span>View {changelog}</span>
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleTag
	],
	exclude: [
		() => select.exists('.markdown-body, .label-draft')
	],
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
