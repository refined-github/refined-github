import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import AlertIcon from 'octicons-plain-react/Alert';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';

// Thresholds for spam detection (in days for account age)
const NEW_ACCOUNT_THRESHOLD_DAYS = 30;
const LOW_FOLLOWERS_THRESHOLD = 2;
const FOLLOWER_IMBALANCE_FOLLOWING_MIN = 10;
const FOLLOWER_IMBALANCE_FOLLOWERS_MAX = 3;

// Type for GitHub user API response
type GitHubUserInfo = {
	created_at: string;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	bio: string | null;
	company: string | null;
	location: string | null;
	blog: string | null;
};

// Cached user info from GitHub REST API
// This fetches once and is reused by all indicators
const getUserInfo = new CachedFunction('spam-indicator-user-info', {
	async updater(username: string): Promise<GitHubUserInfo> {
		const response = await api.v3(`/users/${username}`);
		return {
			created_at: response.created_at,
			public_repos: response.public_repos,
			public_gists: response.public_gists,
			followers: response.followers,
			following: response.following,
			bio: response.bio,
			company: response.company,
			location: response.location,
			blog: response.blog,
		};
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Indicator: Private activity
// Users with private activity may be trying to hide their contribution history
const hasPrivateActivity = new CachedFunction('spam-indicator-private-activity', {
	async updater(username: string): Promise<boolean> {
		const profileUrl = `/${username}`;
		const dom = await fetchDomUncached(profileUrl);
		const profileText = dom.textContent ?? '';
		// Check for "@username's activity is private" text pattern shown on private profiles
		// Using specific pattern to avoid false positives from bio text
		const privateActivityPattern = new RegExp(`@${username}'s activity is private`, 'i');
		return privateActivityPattern.test(profileText);
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Indicator: New account
// Accounts created within the last N days
const isNewAccount = new CachedFunction('spam-indicator-new-account', {
	async updater(username: string): Promise<boolean> {
		const userInfo = await getUserInfo.get(username);
		const createdAt = new Date(userInfo.created_at);
		const accountAgeDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
		return accountAgeDays < NEW_ACCOUNT_THRESHOLD_DAYS;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Indicator: Incomplete profile
// Missing key profile fields (bio, company, location)
const hasIncompleteProfile = new CachedFunction('spam-indicator-incomplete-profile', {
	async updater(username: string): Promise<boolean> {
		const userInfo = await getUserInfo.get(username);
		const emptyFields = [
			!userInfo.bio,
			!userInfo.company,
			!userInfo.location,
			!userInfo.blog,
		].filter(Boolean).length;
		// Flag if 3 or more profile fields are empty
		return emptyFields >= 3;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Indicator: Low followers
// Very few or zero followers
const hasLowFollowers = new CachedFunction('spam-indicator-low-followers', {
	async updater(username: string): Promise<boolean> {
		const userInfo = await getUserInfo.get(username);
		return userInfo.followers <= LOW_FOLLOWERS_THRESHOLD;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Indicator: Follower imbalance
// Following many users but followed by very few (common spam pattern)
const hasFollowerImbalance = new CachedFunction('spam-indicator-follower-imbalance', {
	async updater(username: string): Promise<boolean> {
		const userInfo = await getUserInfo.get(username);
		return userInfo.following > FOLLOWER_IMBALANCE_FOLLOWING_MIN
			&& userInfo.followers < FOLLOWER_IMBALANCE_FOLLOWERS_MAX;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Indicator: No public repos
// Account has no public repositories
const hasNoPublicRepos = new CachedFunction('spam-indicator-no-public-repos', {
	async updater(username: string): Promise<boolean> {
		const userInfo = await getUserInfo.get(username);
		return userInfo.public_repos === 0;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 7},
});

// Define all spam indicators with their display names
const spamIndicators = [
	{name: 'Private activity', check: hasPrivateActivity},
	{name: 'New account', check: isNewAccount},
	{name: 'Incomplete profile', check: hasIncompleteProfile},
	{name: 'Low followers', check: hasLowFollowers},
	{name: 'Follower imbalance', check: hasFollowerImbalance},
	{name: 'No public repos', check: hasNoPublicRepos},
];

// Check all spam indicators and return the names of those that are true
async function getTriggeredIndicators(username: string): Promise<string[]> {
	const results = await Promise.all(
		spamIndicators.map(async indicator => ({
			name: indicator.name,
			triggered: await indicator.check.get(username),
		})),
	);

	return results
		.filter(result => result.triggered)
		.map(result => result.name);
}

async function addIndicator(authorElement: HTMLElement): Promise<void> {
	const username = authorElement.textContent?.trim();
	if (!username) {
		return;
	}

	const triggeredIndicators = await getTriggeredIndicators(username);
	if (triggeredIndicators.length === 0) {
		return;
	}

	// Build tooltip showing which indicators triggered
	const tooltipText = `Potential spam: ${triggeredIndicators.join(', ')}`;

	// Place icon after the author element
	// Using native title attribute for tooltip since this works both for Issues and PRs
	// It seems that the fancy tooltip used by the "Contributor badge" doesn't work on issues
	// or would need different code to make work.
	authorElement.after(
		<span className="ml-1" title={tooltipText}>
			<AlertIcon className="v-align-middle" />
		</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		[
			'[data-testid="issue-body-header-author"]', // Issues
			'a.author.Link--primary[data-hovercard-type="user"]', // PRs (exclude Link--secondary in header)
		],
		addIndicator,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPR,
	],
	init,
});

/*

Test URLs:

Spam indicators test accounts:
- gautamvarmadatla: Private activity
  - Profile: https://github.com/gautamvarmadatla
  - Issue: https://github.com/scikit-learn/scikit-learn/issues/33029
  - PR: https://github.com/scikit-learn/scikit-learn/pull/33030

- casey-brooks: Fork-heavy, potentially spammy activity pattern
  - Profile: https://github.com/casey-brooks

Legitimate accounts (should NOT trigger or trigger minimally):
- Test with well-established users who have complete profiles

*/
