import './reactions-avatars.css';

import {onAbort} from 'abort-utils';
import batchedFunction from 'batched-function';
import React from 'dom-chef';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';
import {$$optional, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';
import {getToken} from '../github-helpers/github-token.js';
import {getConversationNumber, getLoggedInUser} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const arbitraryAvatarLimit = 36;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars
const avatarSize = 16;
const maxAvatarsPerReaction = 9;

type Participant = {
	button: HTMLButtonElement;
	login: string;
	avatarUrl: string;
};

// The React issue layout only lists full names, so the usernames come from the API
const reactionTypes: Record<string, string> = {
	'👍': 'THUMBS_UP',
	'👎': 'THUMBS_DOWN',
	'😄': 'LAUGH',
	'🎉': 'HOORAY',
	'😕': 'CONFUSED',
	'❤️': 'HEART',
	'🚀': 'ROCKET',
	'👀': 'EYES',
};

const reactorsQuery = `
	... on Reactable {
		reactionGroups {
			content
			reactors(first: ${maxAvatarsPerReaction}) {
				nodes {
					... on Actor {
						login
						avatarUrl(size: ${avatarSize * 2})
					}
				}
			}
		}
	}
`;

type ReactionGroup = {
	content: string;
	reactors: {nodes: Array<{login: string; avatarUrl: string}>};
};

function getParticipants(button: HTMLButtonElement): Participant[] {
	let users;

	if (button.getAttribute('role') === 'switch') { // [aria-label] alone is not a differentiator
		users = button.nextElementSibling!
			.textContent
			.replace(/^.+including /, '')
			.replace(/\)/, '')
			.replace(/,? and /, ', ')
			.replace(/, \d+ more/, '')
			.split(', ');
		// Uses optional chaining to throw an error manually later
	} else if (button.nextElementSibling?.tagName === 'TOOL-TIP') {
		// The list of people who commented is in an adjacent `<tool-tip>` element #5698
		users = button.nextElementSibling
			.textContent
			.replace(/ reacted with.*/, '')
			.replace(/,? and /, ', ')
			.replace(/, \d+ more/, '')
			.split(', ');
	} else {
		throw new Error('Unknown reaction button layout');
	}

	const currentUser = getLoggedInUser();
	const participants = [];
	for (const login of users) {
		if (login === currentUser) {
			continue;
		}

		const avatarUrl = getUserAvatar(login, avatarSize);
		if (avatarUrl) {
			participants.push({button, login, avatarUrl});
		}
	}

	return participants;
}

function appendAvatars(reactions: Participant[][]): void {
	if (reactions.length === 0) {
		return;
	}

	const avatarLimit = arbitraryAvatarLimit - (reactions.length * approximateHeaderLength);
	const flatParticipants = flatZip(reactions, avatarLimit);

	for (const {button, login, avatarUrl} of flatParticipants) {
		button.append(
			<span className="avatar-user avatar rgh-reactions-avatar p-0 tmp-p-0 flex-self-center">
				<img
					src={avatarUrl}
					className="d-block"
					width={avatarSize}
					height={avatarSize}
					alt={`@${login}`}
					loading="lazy"
				/>
			</span>,
		);
	}
}

function getCommentId(container: Element): string | undefined {
	// Comments have a node ID, the issue description doesn't
	return closestElementOptional('[data-wrapper-timeline-id]', container)?.dataset.wrapperTimelineId;
}

async function showReactorAvatars(containers: Element[]): Promise<void> {
	// The token is optional, the other layouts work without it
	const hasToken = Boolean(await getToken());
	if (!hasToken) {
		return;
	}

	const containersById = new Map<string | undefined, Element>(
		containers.map(container => [getCommentId(container), container]),
	);
	// Dual query for issue body and individual comments
	const data = await api.v4(`
		repository() {
			issueOrPullRequest(number: ${getConversationNumber()!}) {${reactorsQuery}}
		}
		${
		[...containersById.keys()].filter(id => id !== undefined).map(id =>
			`${api.escapeKey(id)}: node(id: "${id}") {${reactorsQuery}}`
		).join('\n')
	}
	`);

	const currentUser = getLoggedInUser();
	for (const [id, container] of containersById) {
		const {reactionGroups}: {reactionGroups: ReactionGroup[]} = id
			? data[api.escapeKey(id)]
			: data.repository.issueOrPullRequest;
		const reactions = $$optional('button[aria-checked]', container).map(button => {
			const content = reactionTypes[button.getAttribute('aria-label')!.split(' ', 1)[0]];
			return reactionGroups
				.find(group => group.content === content)!.reactors.nodes
				.filter(({login}) => login !== currentUser)
				.map(({login, avatarUrl}) => ({button, login, avatarUrl}));
		});

		// The total limit is per comment, so each container is handled on its own
		appendAvatars(reactions);
	}
}

const showReactorAvatarsBatched = batchedFunction(showReactorAvatars, {delay: 100});

function showAvatarsOn(reactionsContainer: Element): void {
	const buttons = $$optional([
		'button[aria-pressed]', // Discussions, releases, PRs, old issues
		'button[aria-checked]', // React issues
	], reactionsContainer);

	// The latest React issue layout lists names instead of usernames, the others still work
	// Optional chaining: some layouts have nothing after the button
	if (buttons.some(button => button.nextElementSibling?.textContent.startsWith('Reacted by '))) {
		showReactorAvatarsBatched(reactionsContainer);
		return;
	}

	appendAvatars(buttons.map(button => getParticipants(button))); // Get all participants for each reaction
}

const viewportObserver = new IntersectionObserver(changes => {
	for (const change of changes) {
		if (!change.isIntersecting) {
			continue;
		}

		showAvatarsOn(change.target);
		viewportObserver.unobserve(change.target);
	}
}, {
	// Start loading a little before they become visible
	rootMargin: '500px',
});

function observeCommentReactions(commentReactions: Element): void {
	viewportObserver.observe(commentReactions);
}

function init(signal: AbortSignal): void {
	observe(
		[
			// `batch-deferred-content` means the participant list hasn't loaded yet
			'.has-reactions .js-comment-reactions-options:not(batch-deferred-content .js-comment-reactions-options)',
			'div[aria-label="Reactions"]',
		],
		observeCommentReactions,
		{signal},
	);
	onAbort(signal, viewportObserver);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
		pageDetect.isDiscussion,
	],
	init,
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/4119
- Locked PR: https://github.com/refined-github/refined-github/pull/975
- Copilot reaction: https://github.com/refined-github/refined-github/issues/7761
- Dependabot reaction: https://github.com/aio-libs/aiohttp/pull/3809#issuecomment-498809698
- Discussion: https://github.com/parcel-bundler/parcel/discussions/6490
- Locked discussion: https://github.com/orgs/community/discussions/28776
- Deferred participants loading: https://github.com/orgs/community/discussions/30093
- Releases: https://github.com/refined-github/refined-github/releases

*/
