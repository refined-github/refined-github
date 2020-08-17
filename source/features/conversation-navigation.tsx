import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ChevronLeftIcon from 'octicon/chevron-left.svg';
import ChevronRightIcon from 'octicon/chevron-right.svg';
import select from 'select-dom';
import cache from 'webext-storage-cache';

import features from '.';
import {getRepoURL} from '../github-helpers';
import * as api from '../github-helpers/api';
import SearchQuery from '../github-helpers/search-query';

async function init() {
	const previousButton = getButton('Navigate to previous Conversation', ChevronLeftIcon);
	const nextButton = getButton('Navigate to next Conversation', ChevronRightIcon);

	select('.gh-header-meta')?.append(
		<div className="BtnGroup ml-2">
			{previousButton}
			{nextButton}
		</div>,
	);

	const {list, listQuery} = await getConversationList();
	const conversation = list.find(item => item.number === getConversationNumber());

	setButtonHref(
		previousButton,
		listQuery,
		list.find(item => item.cursor === alterCursor(conversation!.cursor, -1))
	);

	setButtonHref(
		nextButton,
		listQuery,
		list.find(item => item.cursor === alterCursor(conversation!.cursor, +1))
	);
}

function setButtonHref(button: HTMLAnchorElement, listQuery: ReturnType<typeof getListQuery>, conversation?: Conversation) {
	if (conversation) {
		const url = new URL(conversation.url);
		url.searchParams.set('q', listQuery.query);
		url.searchParams.set('page', listQuery.page.toString(10));
		button.setAttribute('aria-disabled', 'false');
		button.href = url.href;
	}
}

const getButton = (ariaLabel: string, Icon: () => JSX.Element): HTMLAnchorElement => (
	<a
		aria-disabled="true"
		className="btn btn-lg BtnGroup-item"
		data-hotkey="n"
		aria-label={ariaLabel}
	>
		<Icon/>
	</a>
) as any;

// Current default number of items in a conversation list
const ITEMS_PER_PAGE = 25;

type Conversation = {
	cursor: string;
	number: number;
	url: string;
};

const fetchConversationList = cache.function(
	async (listQuery: ReturnType<typeof getListQuery>): Promise<Conversation[]> => {
		const searchQuery = getConversationSearchQuery(listQuery);

		return api.v4(searchQuery).then(({search}) => search.edges.map((edge: any) => ({
			...edge.node,
			cursor: edge.cursor
		})));
	},
	{
		cacheKey: ([listQuery]) => `${__filebasename}:${JSON.stringify(listQuery)}`,
		maxAge: 1 / 24 // 1 hour from a day is enough
	}
);

async function getConversationList() {
	const listQuery = getListQuery();
	const list = await fetchConversationList(listQuery);
	const currentNumber = getConversationNumber();
	const conversation = list.find(item => item.number === currentNumber);
	const after = getCursor((listQuery.page - 1) * ITEMS_PER_PAGE);
	const before = getCursor((listQuery.page * ITEMS_PER_PAGE) + 1);

	if (conversation!.cursor !== after && conversation!.cursor !== before) {
		return {
			list,
			listQuery
		};
	}

	// `currentConversation` is from previous page, we need to fetch previous page items
	listQuery.page = conversation!.cursor === after ?
		listQuery.page - 1 :
		// `currentConversation` is from next page, we need to fetch next page items
		(conversation!.cursor === before ?
			listQuery.page + 1 :
			listQuery.page);

	return {
		list: await fetchConversationList(listQuery),
		listQuery
	};
}

const noListQuery = (): boolean => !(
	// Allowed also from global conversation list
	pageDetect.isConversationList(new URL(document.referrer)) ||
	(new URL(location.href)).searchParams.has('q')
);

function getListQuery() {
	const referrerUrl = new URL(document.referrer);
	const url = pageDetect.isConversationList(referrerUrl) ? referrerUrl : new URL(location.href);
	const searchQuery = new SearchQuery(url);

	if (pageDetect.isRepoConversationList(referrerUrl)) {
		searchQuery.add(`repo:${getRepoURL()}`);
	}

	return {
		page: Number.parseInt(url.searchParams.get('page') ?? '1', 10),
		query: searchQuery.get()
	};
}

/**
 * When fetching a page of conversations we want to also fetch last item from previous page, and first item from next page.
 * This is needed for cases when we are on a conversation that is last in current query page, and we need to know if items exist on next page.
 * To take into consideration also, than when we are on first item on first page, we don't have a previous item, and we don't want to fetch using a negative cursor.
 * Read more on {@link getCursor} function
 */
function getConversationSearchQuery({page, query}: ReturnType<typeof getListQuery>): string {
	return `
search(
	type: ISSUE,
	first: ${page === 1 ? ITEMS_PER_PAGE + 1 : ITEMS_PER_PAGE + 2},
	after: "${getCursor(page === 1 ? 0 : ((page - 1) * ITEMS_PER_PAGE) - 1)}",
	query: "${query}"
) {
	edges {
		cursor
		node {
			... on Issue { number, url }
			... on PullRequest { number, url }
		}
	}
}
	`;
}

function getConversationNumber(): number {
	const conversationHashtag = select('.gh-header-number')?.textContent ?? '#';
	return Number.parseInt(conversationHashtag.replace('#', ''), 10);
}

/**
 * Get a GitHub GraphQL cursor based on offset number
 * GitHub items cursors have this format e.g. `cursor:1` and are in base64 format
 * First cursor has offset 1, if offset bellow 1 will be used, still correct first items will be in response but with cursor based on given negative offset
 *
 * @param {number} offset
 * @returns {string}
 */
function getCursor(offset: number): string {
	return btoa(`cursor:${offset}`);
}

function alterCursor(cursor: string, diff: number): string {
	const index = Number.parseInt(atob(cursor).replace('cursor:', ''), 10);
	return getCursor(index + diff);
}

void features.add({
	id: __filebasename,
	description: 'Conversation navigation',
	screenshot: 'https://picsum.photos/500/200'
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue
	],
	exclude: [
		noListQuery
	],
	init
});
