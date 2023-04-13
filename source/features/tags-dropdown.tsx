import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import select from 'select-dom';

import * as api from '../github-helpers/api';

import features from '../feature-manager';

const gql = `
	repository() {
		refs(refPrefix: "refs/tags/", last: 100) {
			nodes {
				name
			}
		}
	}
`;

async function init(): Promise<false | void> {
	const {repository} = await api.v4(gql);
	const tags = repository.refs.nodes as Array<{name: string}>;
	if (tags.length === 0) {
		return false;
	}

	const searchField = select('input#release-filter')!;
	searchField.after(
		<datalist id="rgh-tags-dropdown">
			{tags.reverse().map(tag => <option value={tag.name}/>)}
		</datalist>,
	);
	searchField.setAttribute('list', 'rgh-tags-dropdown');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	init,
});
