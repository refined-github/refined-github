import './wait-for-build.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers';
import pluralize from '../helpers/pluralize';
import * as api from '../github-helpers/api';
import elementReady from 'element-ready';

async function handleCancelClick(event: delegate.Event): Promise<void> {
	const button = event.delegateTarget;
	event.preventDefault();
	button.classList.add('btn-sm');
	button.textContent = 'Delete fork';
}

async function handleFirstClick(event: delegate.Event): Promise<void> {
	const button = event.delegateTarget;
	button.classList.remove('btn-sm');
	event.preventDefault();

	let secondsLeft = 5;
	do {
		button.textContent = `Deleting fork in ${pluralize(secondsLeft, '$$ second')}`;
		await delay(1000); // eslint-disable-line no-await-in-loop
	} while (--secondsLeft);

	button.textContent = 'Deleting fork…';

	alert('YO!');
	console.log(await api.v3('', {
		method: 'DELETE'
	}));
	alert('done');
}

async function init(): Promise<void> {
	await api.expectToken();

	(await elementReady('.pagehead-actions'))!.prepend(
		<li>
			<a
				href={getRepo()!.nameWithOwner + '/settings'}
				className="btn btn-sm btn-danger rgh-quick-fork-deletion"
				style={{
					fontVariantNumeric: 'tabular-nums'
				}}
			>
				Delete fork
			</a>
		</li>
	);

	delegate(document, '.rgh-quick-fork-deletion.btn-sm', 'click', handleFirstClick);
	delegate(document, '.rgh-quick-fork-deletion', 'click', handleCancelClick);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isForkedRepo
	],
	awaitDomReady: false,
	init
});
