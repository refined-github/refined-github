import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ChevronLeftIcon from 'octicon/chevron-left.svg';
import ChevronRightIcon from 'octicon/chevron-right.svg';
import select from 'select-dom';
import cache from 'webext-storage-cache';

import features from '.';
import {getRepoURL, getUsername} from '../github-helpers';
import * as api from '../github-helpers/api';

void features.add({
	id: __filebasename,
	description: 'Conversation navigation',
	screenshot: 'https://picsum.photos/500/200'
}, {
	include: [pageDetect.isPR, pageDetect.isIssue],
	exclude: [noListQuery],
	async init() {
		const {list, listQuery} = await getConversationList();

		const conversationNumber = getConversationNumber();
		const conversation = list.search.edges.find(edge => edge.node.number === conversationNumber);

		const previousCursor = conversation ? getPreviousCursor(conversation.cursor) : undefined;
		const previousConversation = previousCursor ?
			list.search.edges.find(edge => edge.cursor === previousCursor) :
			undefined;

		const nextCursor = conversation ? getNextCursor(conversation.cursor) : undefined;
		const nextConversation = nextCursor ?
			list.search.edges.find(edge => edge.cursor === nextCursor) :
			undefined;

		const previousUrl = previousConversation ? new URL(previousConversation.node.url) : undefined;
		if (previousUrl) {
			previousUrl.searchParams.set('q', listQuery.query);
			previousUrl.searchParams.set('page', listQuery.page.toString(10));
		}

		const nextUrl = nextConversation ? new URL(nextConversation.node.url) : undefined;
		if (nextUrl) {
			nextUrl.searchParams.set('q', listQuery.query);
			nextUrl.searchParams.set('page', listQuery.page.toString(10));
		}

		select('.gh-header-meta')?.append(
			<div className="BtnGroup ml-2">
				<a
					aria-disabled={previousUrl ? 'false' : 'true'}
					className="btn btn-lg BtnGroup-item ml-0"
					href={previousUrl ? previousUrl.href : undefined}
					data-hotkey="p"
					aria-label="Navigate to next Conversation"
				>
					<ChevronLeftIcon/>
				</a>
				<a
					aria-disabled={nextUrl ? 'false' : 'true'}
					className="btn btn-lg BtnGroup-item ml-0"
					href={nextUrl ? nextUrl.href : undefined}
					data-hotkey="n"
					aria-label="Navigate to previous Conversation"
				>
					<ChevronRightIcon/>
				</a>
			</div>,
		);
	}
});

/**
 * Current default number of items in a conversation list
 * @type {number}
 */
const ITEMS_PER_PAGE = 25;

type Edge = {
	cursor: string;
	node: {
		number: number;
		url: string;
	};
};

const fetchConversationList = cache.function(
	async ({query, page}: ReturnType<typeof getListQuery>): Promise<Record<'search', { edges: Edge[] }>> => {
		const {after} = getPageCursors(page);

		/**
		 * When fetching a page of conversations we want to also fetch
		 * last item from previous page, and first item from next page
		 * this is needed for cases when we a on a conversation that is last
		 * in current query page, and we need to know if items exist on next page
		 * To take into consideration also, than when we are on first item on first page
		 * We don't have a previous item, and we don't want to fetch from using a negative cursor
		 * Read more on {@link getCursor} function
		 */

		const previousAfter = page === 1 ? after : getPreviousCursor(after);
		const fetchItemsCount = page === 1 ? ITEMS_PER_PAGE + 1 : ITEMS_PER_PAGE + 2;

		return api.v4(getConversationSearchQuery(fetchItemsCount, previousAfter, query));
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
	const currentConversation = list.search.edges.find(edge => edge.node.number === currentNumber);
	const {after, before} = getPageCursors(listQuery.page);

	// TODO: there is a case when last page has only one item
	// that page gets cached for some time, still other conversations may appear

	// `currentConversation` is from previous page
	// we need to fetch previous page items
	if (currentConversation?.cursor === after) {
		const newListQuery = {
			...listQuery,
			page: listQuery.page - 1
		};
		return {
			list: await fetchConversationList(newListQuery),
			listQuery: newListQuery
		};
	}

	// `currentConversation` is from next page
	// we need to fetch next page items
	if (currentConversation?.cursor === before) {
		const newListQuery = {
			...listQuery,
			page: listQuery.page + 1
		};
		return {
			list: await fetchConversationList(newListQuery),
			listQuery: newListQuery
		};
	}

	return {
		list,
		listQuery
	};
}

function noListQuery(): boolean {
	return !(
		// Allowed also from global conversation list
		pageDetect.isConversationList(new URL(document.referrer)) ||
		(new URL(location.href)).searchParams.has('q')
	);
}

function getListQuery() {
	const referrerUrl = new URL(document.referrer);

	// Coming from another issue with query in URL
	if (!pageDetect.isConversationList(referrerUrl)) {
		return parseConversationListURL(new URL(location.href));
	}

	// Default conversation lists, even global, don't have query in URL
	// But it seems there is some refined-github feature
	// that adds a default query in URL based on query input
	// Make sure we have some query as a fallback
	// Added fallbacks are current GitHub defaults
	const query = referrerUrl.searchParams.get('q');

	if (pageDetect.isGlobalConversationList(referrerUrl)) {
		// Is global pull requests list
		if (referrerUrl.pathname.split('/', 2)[1] === 'pulls') {
			referrerUrl.searchParams.set('q', query ?? `is:open is:pr author:${getUsername()} archived:false`);
		}

		// Is global issues list
		if (referrerUrl.pathname.split('/', 2)[1] === 'issues') {
			referrerUrl.searchParams.set('q', query ?? `is:open is:issue author:${getUsername()} archived:false`);
		}
	}

	if (pageDetect.isRepoConversationList(referrerUrl)) {
		if (pageDetect.isRepoIssueList(referrerUrl)) {
			referrerUrl.searchParams.set('q', `${query ?? 'is:issue is:open'} repo:${getRepoURL()}`);
		}

		if (pageDetect.isRepoPRList(referrerUrl)) {
			referrerUrl.searchParams.set('q', `${query ?? 'is:pr is:open'} repo:${getRepoURL()}`);
		}
	}

	return parseConversationListURL(referrerUrl);
}

function getConversationSearchQuery(first: number, after: string, query: string): string {
	return `
search(
	type: ISSUE,
	first: ${first},
	after: "${after}",
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

function parseConversationListURL(url: URL) {
	return {
		query: url.searchParams.get('q') ?? '',
		page: Number.parseInt(url.searchParams.get('page') ?? '1', 10)
	};
}

/**
 * Get a GitHub GraphQL cursor based on offset number
 * GitHub items cursors have this format e.g. `cursor:1` and are in base64 format
 * First cursor is offset 1, if offset bellow 1 will be used
 * Still correct first items will be in response but with cursor based on given negative offset
 *
 * @param {number} offset
 * @returns {string}
 */
function getCursor(offset: number): string {
	return btoa(`cursor:${offset}`);
}

function getOffset(cursor: string): number {
	return Number.parseInt(atob(cursor).replace('cursor:', ''), 10);
}

function getPreviousCursor(cursor: string) {
	return getCursor(getOffset(cursor) - 1);
}

function getNextCursor(cursor: string) {
	return getCursor(getOffset(cursor) + 1);
}

function getPageCursors(page: number) {
	return {
		after: getCursor((page - 1) * ITEMS_PER_PAGE),
		before: getCursor((page * ITEMS_PER_PAGE) + 1)
	};
}
