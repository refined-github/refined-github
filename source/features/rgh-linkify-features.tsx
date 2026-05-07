import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$closestOptional} from 'select-dom';

import {getNewFeatureName} from '../feature-data.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';
import {wrap} from '../helpers/dom-utils.js';
import {logError} from '../helpers/errors.js';
import {getFeatureRelatedIssuesQuery, getFeatureRelatedIssuesUrl, getFeatureUrl} from '../helpers/rgh-links.js';
import observe from '../helpers/selector-observer.js';

const relatedIssuesCountByFeature = new Map<FeatureId, Promise<number>>();

async function getOpenRelatedIssuesCount(id: FeatureId): Promise<number> {
	let countPromise = relatedIssuesCountByFeature.get(id);
	if (!countPromise) {
		const query = `${getFeatureRelatedIssuesQuery(id)} repo:refined-github/refined-github`;
		countPromise = (async () => {
			const response = await api.v3(`/search/issues?q=${encodeURIComponent(query)}`);
			return (response as unknown as {total_count: number}).total_count;
		})();
		relatedIssuesCountByFeature.set(id, countPromise);
	}

	return countPromise;
}

async function addOpenRelatedIssuesCount(id: FeatureId, element: HTMLElement): Promise<void> {
	const count = await getOpenRelatedIssuesCount(id);
	const nextElement = element.nextElementSibling;
	if (
		count === 0
		|| !element.isConnected
		|| (nextElement instanceof HTMLElement && nextElement.matches('sup[data-rgh-feature-related-count]'))
	) {
		return;
	}

	const relatedIssuesUrl = getFeatureRelatedIssuesUrl(id);
	element.after(
		<sup data-rgh-feature-related-count="">
			<a className="Link--muted" href={relatedIssuesUrl.href} data-turbo-frame="repo-content-turbo-frame">{count}</a>
		</sup>,
	);
}

function linkifyFeature(possibleFeature: HTMLElement): void {
	const originalText = possibleFeature.textContent;
	const id = getNewFeatureName(originalText);
	if (!id) {
		return;
	}

	const href = getFeatureUrl(id);
	// If the original text is different from the resolved ID, it's an old name
	const isOldName = originalText !== id;
	const title = isOldName ? `Now called ${id}` : undefined;
	let wasLinked = false;

	const possibleLink = possibleFeature.firstElementChild ?? possibleFeature;
	if (possibleLink instanceof HTMLAnchorElement) {
		// Possible DOM structure:
		// - <a>
		// - <code> > <a>
		possibleLink.href = href;
		possibleLink.classList.add('color-fg-accent');
		if (title) {
			possibleLink.title = title;
		}

		wasLinked = true;
	} else if (!$closestOptional('a', possibleFeature)) {
		// Possible DOM structure:
		// - <code>
		wrap(
			possibleFeature,
			<a
				className="color-fg-accent"
				data-turbo-frame="repo-content-turbo-frame"
				href={href}
				title={title}
			/>,
		);
		wasLinked = true;
	}

	if (wasLinked) {
		void (async () => {
			try {
				await addOpenRelatedIssuesCount(id, possibleFeature);
			} catch (error) {
				if (error instanceof Error) {
					logError(error);
				}
			}
		})();
	}
}

function init(signal: AbortSignal): void {
	observe(
		[
			'.js-issue-title code', // `isPRConversation`, Old view `isIssue`
			'h1[class^="prc-PageHeader-Title"] code', // `isPRFiles`,
			'[data-testid="issue-title"] code', // `isIssue`
			'.js-comment-body code', // Old view `hasComments`
			'.markdown-body code', // `hasComments`, `isReleasesOrTags`
			'[class^="CommitHeader-module__commitMessageContainer"] code', // `isSingleCommit`,
			`${commitTitleInLists} code`, // `isCommitList`,
			'.react-directory-commit-message code', // `isRepoTree`
		],
		linkifyFeature,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isAnyRefinedGitHubRepo,
	],
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
		pageDetect.isCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isRepoWiki,
		pageDetect.isPR,
		pageDetect.isIssue,
		pageDetect.isRepoTree,
	],
	init,
});

/*

Test URLs

- hasComments: https://github.com/refined-github/refined-github/issues/8867
- isReleasesOrTags: https://github.com/refined-github/refined-github/releases
- isSingleReleaseOrTag: https://github.com/refined-github/refined-github/releases/tag/23.7.25
- isCommitList: https://github.com/refined-github/refined-github/commits/main
- isSingleCommit: https://github.com/refined-github/refined-github/commit/d63e2d97fc4d85f986a120fb49cd8e09f6785b93
- isRepoWiki: https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions
- isPR: https://github.com/refined-github/refined-github/pull/8904
- isIssue: https://github.com/refined-github/refined-github/issues/8902

*/
