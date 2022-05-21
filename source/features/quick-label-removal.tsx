import './quick-label-removal.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {XIcon} from '@primer/octicons-react';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import showToast from '../github-helpers/toast';
import isArchivedRepo from '../helpers/is-archived-repo';
import {getConversationNumber} from '../github-helpers';

const canNotEditLabels = onetime((): boolean => !select.exists('.label-select-menu .octicon-gear'));

async function removeLabelButtonClickHandler(event: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;
	const label = removeLabelButton.closest('a')!;

	label.hidden = true;
	try {
		await api.v3(`issues/${getConversationNumber()!}/labels/${removeLabelButton.dataset.name!}`, {
			method: 'DELETE',
		});
	} catch (error: unknown) {
		void showToast(error as Error);
		removeLabelButton.blur();
		label.hidden = false;
		return;
	}

	label.remove();
}

async function init(): Promise<Deinit[]> {
	await api.expectToken();

	return [
		observe('.js-issue-labels .IssueLabel:not(.rgh-quick-label-removal-already-added)', {
			constructor: HTMLElement,
			add(label) {
				label.classList.add('rgh-quick-label-removal-already-added', 'd-inline-flex');
				label.append(
					<button
						type='button'
						aria-label='Remove this label'
						className='btn-link tooltipped tooltipped-nw rgh-quick-label-removal'
						data-name={label.dataset.name}
					>
						<XIcon/>
					</button>,
				);
			},
		}),

		delegate(document, '.rgh-quick-label-removal:not([disabled])', 'click', removeLabelButtonClickHandler),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	exclude: [
		canNotEditLabels,
		isArchivedRepo,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
