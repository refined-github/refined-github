import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import * as api from '../github-helpers/api';
import features from '../feature-manager';
import {buildRepoURL} from '../github-helpers';
import observe from '../helpers/selector-observer';

let latestTags: string[] | undefined;

const gql = `
	repository() {
		refs(refPrefix: "refs/tags/", last: 100) {
			nodes {
				name
			}
		}
	}
`;

// `datalist` selections don't have an `inputType`
function selectionHandler(event: DelegateEvent<Event, HTMLInputElement>): void {
	const field = event.delegateTarget;
	const selectedTag = field.value;
	if (!('inputType' in event) && latestTags!.includes(selectedTag)) {
		location.href = buildRepoURL('releases/tag', selectedTag);
		field.value = '';
	}
}

async function addList(searchField: HTMLInputElement): Promise<void> {
	const {repository} = await api.v4(gql);
	const nodes = repository.refs.nodes as Array<{name: string}>;
	if (nodes.length === 0) {
		return;
	}

	// Save globally
	latestTags = nodes.map(({name}) => name).reverse();

	searchField.after(
		<datalist id="rgh-tags-dropdown">
			{latestTags.map(tag => <option value={tag}/>)}
		</datalist>,
	);
	searchField.setAttribute('list', 'rgh-tags-dropdown');
}

const searchFieldSelector = 'input#release-filter';
async function init(signal: AbortSignal): Promise<void> {
	observe(searchFieldSelector, addList, {signal});
	delegate(document, searchFieldSelector, 'input', selectionHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	init,
});
