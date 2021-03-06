/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import {GitBranchIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import render from '../helpers/render';

import features from '.';
import * as api from '../github-helpers/api';
import LoadingIcon from '../github-helpers/icon-loading';

const getBranchBaseSha = async (branchName: string): Promise<string> => {
	const {repository} = await api.v4(`
		repository() {
			ref(qualifiedName: "${branchName}") {
				target {
					oid
				}
			}
		}
	`);

	return repository.ref.target.oid;
};

async function createBranch(newBranchName: string, baseSha: string): Promise<true | string> {
	const response = await api.v3('git/refs', {
		method: 'POST',
		body: {
			sha: baseSha,
			ref: 'refs/heads/' + newBranchName
		},
		ignoreHTTPStatus: true
	});

	return response.ok || response.message;
}

async function cloneBranch({delegateTarget: cloneButton}: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	const branchName = cloneButton.closest('[branch]')!.getAttribute('branch')!;

	const currentBranch = getBranchBaseSha(branchName);
	let newBranchName = prompt('Enter the new branch name')?.trim();

	while (newBranchName) {
		cloneButton.replaceWith(render(<LoadingIcon className="ml-2"/>));
		// eslint-disable-next-line no-await-in-loop
		const result = await createBranch(newBranchName, await currentBranch);
		select('.rgh-loading-icon')!.replaceWith(cloneButton);

		if (result === true) {
			break;
		}

		newBranchName = prompt(result.replace('refs/heads/' + newBranchName, 'This') + '\nEnter the new branch name', newBranchName)?.trim();
	}

	if (!newBranchName) {
		return;
	}

	textFieldEdit.set(
		select('input[name="query"]')!,
		newBranchName
	);
}

async function init(): Promise<void | false> {
	await api.expectToken();
	const deleteIconClass = [
		'branch-filter-item-controller .octicon-trashcan', // Pre "Repository refresh" layout
		'branch-filter-item .octicon-trashcan'
	].join();

	observe(deleteIconClass, {
		add(deleteIcon) {
			// Branches with open PRs use `span`, the others use `form`
			deleteIcon.closest('form, span')!.before(render(
				<button
					type="button"
					aria-label="Clone this branch"
					className="link-gray Link--secondary btn-link tooltipped tooltipped-nw ml-3 rgh-clone-branch"
				>
					<GitBranchIcon/>
				</button>
			));
		}
	});

	delegate(document, '.rgh-clone-branch', 'click', cloneBranch);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isBranches
	],
	init: onetime(init)
});
