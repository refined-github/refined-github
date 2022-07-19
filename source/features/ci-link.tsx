import './ci-link.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import attachElement from '../helpers/attach-element';

async function getHead(): Promise<string> {
	const {repository} = await api.v4(`
		repository() {
			defaultBranchRef {
				target {
					oid
				}
			}
		}
	`);

	return repository.defaultBranchRef.target.oid;
}

function getCiDetails(commit: string): HTMLElement {
	const endpoint = `/${getRepo()!.nameWithOwner}/commits/checks-statuses-rollups`;
	return (
		// `span` also required by `attachElement`’s deduplicator
		<span className="rgh-ci-link">
			<batch-deferred-content hidden data-url={endpoint}>
				<input
					name="oid"
					value={commit}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>
	);
}

async function init(): Promise<false | void> {
	const head = await getHead();

	attachElement({
		// Append to repo title (aware of forks and private repos)
		anchor: select('[itemprop="name"]')!.parentElement,
		append: () => getCiDetails(head),
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	awaitDomReady: false,
	init,
});
