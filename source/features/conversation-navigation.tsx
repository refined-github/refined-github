import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import ChevronLeftIcon from 'octicon/chevron-left.svg';
import ChevronRightIcon from 'octicon/chevron-right.svg';

import features from '.';
import * as api from '../github-helpers/api';
import SearchQuery from '../github-helpers/search-query';
import looseParseInt from '../helpers/loose-parse-int';
import {getRepoURL, getConversationNumber} from '../github-helpers';

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
	) as unknown as HTMLAnchorElement;
}

function setButtonHref(button: HTMLAnchorElement, query: string, page: number, conversation?: Conversation) {
	if (conversation) {
		const url = new URL(conversation.url);
		url.searchParams.set('q', query);
		url.searchParams.set('page', String(page));
		button.removeAttribute('aria-disabled');
		button.href = url.href;
	}
}

type Conversation = {
	cursor: number;
	number: number;
	url: string;
};

const fetchConversationList = cache.function(async (query: string, page: number): Promise<Conversation[]> => {
		// When fetching a page of conversations we want to also fetch last item from previous page, and first item from next page.
		// This is needed for cases when conversation is first/last in list, and we need to know if items exist on previous/next page.
		// To take into consideration also, that when we are on first item on first page, we don't have a previous item, and we don't want to fetch using a negative cursor.
		const {search} = await api.v4(`
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
	`);

		return search.edges.map((edge: any) => ({
			...edge.node,
			// GitHub GraphQL cursor is an offset number starting at 1, with prefix `cursor:` and converted to base64.
			// e.g. offset 42 is `cursor:42` and converted to base64 is `Y3Vyc29yOjQy`
			// Always query considering items offsets starting at 1, otherwise unexpected results may happen.
			cursor: looseParseInt(atob(edge.cursor))
		}));
	},
	{
		cacheKey: ([query, page]) => `${__filebasename}:${query}/${page}`,
		maxAge: 1 / 24
	});

// Current default number of items in a conversation list
const ITEMS_PER_PAGE = 25;

async function getConversationList(conversationNumber: number) {
	const listQuery = getConversationListQuery();
	const query = listQuery.get();
	let page = Number(listQuery.searchParams.get('page') ?? 1);

	const list = await fetchConversationList(query, page);
	const conversation = list.find(item => item.number === conversationNumber)!;

	if (conversation.cursor === (page - 1) * ITEMS_PER_PAGE) {
		// `currentConversation` is from previous page, we need to fetch previous page items
		page -= 1;
	} else if (conversation.cursor === (page * ITEMS_PER_PAGE) + 1) {
		// `currentConversation` is from next page, we need to fetch next page items
		page += 1;
	} else {
		return {query, page, list};
	}

	return {
		query,
		page,
		list: await fetchConversationList(query, page)
	};
}

const noListQuery = (): boolean => !(
	// Allowed also from global conversation list
	pageDetect.isConversationList(new URL(document.referrer)) ||
	new URL(location.href).searchParams.has('q')
);

function getConversationListQuery(): SearchQuery {
	const referrerUrl = new URL(document.referrer);
	const url = pageDetect.isConversationList(referrerUrl) ? referrerUrl : location;

	if (pageDetect.isRepoConversationList(url)) {
		return new SearchQuery(url).add(`repo:${getRepoURL()}`);
	}

	return new SearchQuery(url);
}

async function init() {
	const previousButton = getButton('previous');
	const nextButton = getButton('next');

	select('.gh-header-meta')!.append(
		<div className="BtnGroup ml-2">
			{previousButton}
			{nextButton}
		</div>
	);

	const conversationNumber = getConversationNumber();
	const {list, query, page} = await getConversationList(conversationNumber);
	const conversation = list.find(item => item.number === conversationNumber);

	setButtonHref(
		previousButton,
		query,
		page,
		list.find(item => item.cursor === conversation!.cursor - 1)
	);

	setButtonHref(
		nextButton,
		query,
		page,
		list.find(item => item.cursor === conversation!.cursor + 1)
	);
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
