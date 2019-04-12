import React from 'dom-chef';
import * as api from '../libs/api';
import features from '../libs/features';
import select from 'select-dom';
import { getRepoURL } from '../libs/utils';

const commitsResponsePerPage = 30;
const commitListPerPage = 35;

const lastPageRegex = /next.*page=(\d+)/;

async function getLastPage(): Promise<number> {
	const url = `${api.api3}repos/${getRepoURL()}/commits?sha=`;
	const response = await fetch(url, { method: 'head' });

	const paginationLinks = response.headers.get('link') || '';
	const lastPageMatches = paginationLinks.match(lastPageRegex);

	return lastPageMatches ? +lastPageMatches[1] : 1;
}

function calculateLastPage(lastPage: number, lastPageItems: number) {
	const totalCommits = (lastPage - 1) * commitsResponsePerPage + lastPageItems;

	return Math.ceil(totalCommits / commitListPerPage);
}

async function getLastPageUrl(): Promise<string> {
	const lastPage = await getLastPage();
	const response = await api.v3(`repos/${getRepoURL()}/commits?sha=&page=${lastPage}`);

	const commitListLastPage = calculateLastPage(+lastPage, response.length);

	return `${location.pathname}?page=${commitListLastPage}`;
}

function createButton(text: string, link: string, disabled: boolean): HTMLElement {
	const button = (
		<a rel="nofollow" class="btn btn-outline BtnGroup-item" href={link}>
			{text}
		</a>
	);

	if (disabled) {
		button.classList.add('disabled');
	}

	return button;
}

async function addButtonsToPaginate(buttonGroup: HTMLElement) {
	const firstPageUrl = location.pathname;
	const lastPageUrl = await getLastPageUrl();

	const newerButton = buttonGroup.firstElementChild;
	const olderButton = buttonGroup.lastElementChild;

	const newestButton = createButton(
		'< Newest',
		firstPageUrl,
		!!newerButton.getAttribute('disabled')
	);
	const oldestButton = createButton(
		'Oldest >',
		lastPageUrl,
		!!olderButton.getAttribute('disabled')
	);

	buttonGroup.prepend(newestButton);
	buttonGroup.append(oldestButton);
}

async function init() {
	const buttonGroup = select('.paginate-container .BtnGroup');

	if (!buttonGroup) {
		return;
	}

	await addButtonsToPaginate(buttonGroup);
}

features.add({
	id: 'oldest-newest-commit-list',
	include: [features.isCommitList],
	load: features.onAjaxedPages,
	init
});
