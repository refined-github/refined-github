import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import ChevronLeftIcon from 'octicon/chevron-left.svg';
import ChevronRightIcon from 'octicon/chevron-right.svg';

import features from '.';
import * as api from '../github-helpers/api';
import SearchQuery from '../github-helpers/search-query';
import {getRepoURL} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';

function getButton(direction: string): HTMLAnchorElement {
	return (
		<a
			aria-disabled="true"
			className="btn btn-lg BtnGroup-item"
			aria-label={`Navigate to ${direction} Conversation`}
			data-hotkey={direction.charAt(0)}
		>
			{direction === 'next' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
		</a>
	) as unknown;
}

async function init() {
	const previousButton = getButton('previous');
	const nextButton = getButton('next');

	select('.gh-header-meta')?.append(
		<div className="BtnGroup ml-2">
			{previousButton}
			{nextButton}
		</div>
	);

	const conversationNumber = looseParseInt(select('.gh-header-number')?.textContent ?? '');
	const {list, listQuery} = await getConversationList(conversationNumber);
	const conversation = list.find(item => item.number === conversationNumber);

	setButtonHref(
		previousButton,
		listQuery,
		list.find(item => item.cursor === conversation!.cursor - 1)
	);

	setButtonHref(
		nextButton,
		listQuery,
		list.find(item => item.cursor === conversation!.cursor + 1)
	);
}

function setButtonHref(button: HTMLAnchorElement, listQuery: ReturnType<typeof getListQuery>, conversation?: Conversation) {
	if (conversation) {
		const url = new URL(conversation.url);
		url.searchParams.set('q', listQuery.query);
		url.searchParams.set('page', listQuery.page);
		button.setAttribute('aria-disabled', 'false');
		button.href = url.href;
	}
}

type Conversation = {
	cursor: number;
	number: number;
	url: string;
};

const fetchConversationList = cache.function(
	async (listQuery: ReturnType<typeof getListQuery>): Promise<Conversation[]> => {
		const searchQuery = getConversationSearchQuery(listQuery);

		const {search} = await api.v4(searchQuery)
		return search.edges.map((edge: any) => ({
			...edge.node,
			// GitHub GraphQL cursor is an offset number starting at 1, with prefix `cursor:` and converted to base64.
			// e.g. offset 42 is `cursor:42` and converted to base64 is `Y3Vyc29yOjQy`
			// Always query considering items offsets starting at 1, otherwise unexpected results may happen.
			cursor: looseParseInt(atob(edge.cursor))
		})));
	},
	{
		cacheKey: ([listQuery]) => `${__filebasename}:${JSON.stringify(listQuery)}`,
		maxAge: 1 / 24 // 1 hour from a day is enough
	}
);

// Current default number of items in a conversation list
const ITEMS_PER_PAGE = 25;

async function getConversationList(conversationNumber: number) {
	const listQuery = getListQuery();
	const list = await fetchConversationList(listQuery);
	const conversation = list.find(item => item.number === conversationNumber);
	const after = (listQuery.page - 1) * ITEMS_PER_PAGE;
	const before = (listQuery.page * ITEMS_PER_PAGE) + 1;

	if (conversation!.cursor !== after && conversation!.cursor !== before) {
		return {
			list,
			listQuery
		};
	}

	if (conversation!.cursor === after) {
		// `currentConversation` is from previous page, we need to fetch previous page items
		listQuery.page -= 1;
	} else if (conversation!.cursor === before) {
		// `currentConversation` is from next page, we need to fetch next page items
		listQuery.page += 1;
	}

	return {
		list: await fetchConversationList(listQuery),
		listQuery
	};
}

const noListQuery = (): boolean => !(
	// Allowed also from global conversation list
	pageDetect.isConversationList(new URL(document.referrer)) ||
	new URL(location.href).searchParams.has('q')
);

function getListQuery() {
	const referrerUrl = new URL(document.referrer);
	const url = pageDetect.isConversationList(referrerUrl) ? referrerUrl : new URL(location.href);
	const searchQuery = new SearchQuery(url);

	if (pageDetect.isRepoConversationList(referrerUrl)) {
		searchQuery.add(`repo:${getRepoURL()}`);
	}

	return {
		page: Number(url.searchParams.get('page') ?? 1),
		query: searchQuery.get()
	};
}

// When fetching a page of conversations we want to also fetch last item from previous page, and first item from next page.
// This is needed for cases when conversation is first/last in list, and we need to know if items exist on previous/next page.
// To take into consideration also, than when we are on first item on first page, we don't have a previous item, and we don't want to fetch using a negative cursor.
function getConversationSearchQuery({page, query}: ReturnType<typeof getListQuery>): string {
	return `
		search(
			type: ISSUE,
			first: ${page === 1 ? ITEMS_PER_PAGE + 1 : ITEMS_PER_PAGE + 2},
			after: "${btoa(`cursor:${page === 1 ? 0 : ((page - 1) * ITEMS_PER_PAGE) - 1}`)}",
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

void features.add({
	id: __filebasename
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
