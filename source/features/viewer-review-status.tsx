import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CommentIcon from 'octicons-plain-react/Comment';
import CheckCircleIcon from 'octicons-plain-react/CheckCircle';
import XCircleIcon from 'octicons-plain-react/XCircle';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import {openPrsListLink} from '../github-helpers/selectors.js';

async function getPrReviews(links: HTMLAnchorElement[]): Promise<void> {
	const prConfigs = links.map(link => {
		const [, owner, name, , prNumber] = link.pathname.split('/');
		const key = api.escapeKey(owner, name, prNumber);
		return {
			key,
			link,
			owner,
			name,
			number: Number(prNumber),
		};
	});

	const {
		viewer: {login},
	} = await api.v4('viewer { login }');

	if (!login) {
		return;
	}

	// Batch queries cannot be exported to .gql files
	const batchQuery = prConfigs
		.map(
			({key, owner, name, number}) => `
          ${key}: repository(owner: "${owner}", name: "${name}") {
              pullRequest(number: ${number}) {
                  reviews(author:"${login}", last:1) {
                      edges {
                          node { 
                              state
                          }
                      }
                  }
              }
          }
      `,
		)
		.join('\n');

	const prDatas = await api.v4(batchQuery);

	for (const pr of prConfigs) {
		const review = prDatas[pr.key].pullRequest.reviews.edges[0];
		if (!review) {
			continue;
		}

		const iconValues = getIconValues(review.node.state);

		if (!iconValues) {
			continue;
		}

		pr.link.after(
			<a
				className={`tooltipped tooltipped-e color-fg-${iconValues.color} ml-2`}
				aria-label={iconValues.label}
				href={`${pr.link.pathname}`}
			>
				{iconValues.icon}
			</a>,
		);
	}
}

function getIconValues(
	status: string,
): undefined | {icon: JSX.Element; label: string; color: string} {
	switch (status) {
		case 'APPROVED': {
			return {
				icon: <CheckCircleIcon className="v-align-middle"/>,
				label: 'You approved this PR',
				color: 'success',
			};
		}

		case 'CHANGES_REQUESTED': {
			return {
				icon: <XCircleIcon className="v-align-middle"/>,
				label: 'Your requested change on this PR',
				color: 'danger',
			};
		}

		case 'COMMENTED': {
			return {
				icon: <CommentIcon className="v-align-middle"/>,
				label: 'You commented this PR',
				color: 'muted',
			};
		}

		default: {
			return undefined;
		}
	}
}

function init(signal: AbortSignal): void {
	observe(openPrsListLink, batchedFunction(getPrReviews, {delay: 100}), {
		signal,
	});
}

void features.add(import.meta.url, {
	include: [pageDetect.isPRList],
	init,
});

/*
Test URLs
https://github.com/pulls
https://github.com/refined-github/sandbox/pulls
*/
