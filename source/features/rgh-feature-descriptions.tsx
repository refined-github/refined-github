import './rgh-feature-descriptions.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {CopyIcon} from '@primer/octicons-react';
import cache from 'webext-storage-cache';

import features from '../feature-manager';
import {featuresMeta} from '../../readme.md';
import {getNewFeatureName} from '../options-storage';
import {isRefinedGitHubRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';
import {HotfixStorage} from '../helpers/hotfix';
import {createRghIssueLink} from '../helpers/rgh-issue-link';

async function add(infoBanner: HTMLElement): Promise<void> {
	const [, currentFeature] = /source\/features\/([^.]+)/.exec(location.pathname) ?? [];
	// Enable link even on past commits
	const currentFeatureName = getNewFeatureName(currentFeature);
	const feature = featuresMeta.find(feature => feature.id === currentFeatureName);
	if (!feature) {
		return;
	}

	const conversationsUrl = new URL('https://github.com/refined-github/refined-github/issues');
	conversationsUrl.searchParams.set('q', `sort:updated-desc "${feature.id}"`);

	infoBanner.before(
		// Block and width classes required to avoid margin collapse
		<div className="Box mb-3 d-inline-block width-full">
			<div className="Box-row d-flex gap-3 flex-wrap">
				<div className="rgh-feature-description">
					<h3 className="mb-2"><code>{feature.id}</code>
						<clipboard-copy
							aria-label="Copy"
							data-copy-feedback="Copied!"
							value={feature.id}
							class="Link--onHover color-fg-muted d-inline-block ml-2"
							tabindex="0"
							role="button"
						>
							<CopyIcon className="v-align-baseline"/>
						</clipboard-copy>
					</h3>
					{ /* eslint-disable-next-line react/no-danger */ }
					<div dangerouslySetInnerHTML={{__html: feature.description}} className="h3"/>
					<div className="no-wrap" data-turbo-frame="repo-content-turbo-frame">
						<a href={conversationsUrl.href}>Related issues</a>
						{
							location.pathname.endsWith('css')
								? <> • <a href={location.pathname.replace('.css', '.tsx')}>See JavaScript</a></>
								: undefined
						}
					</div>
				</div>
				{feature.screenshot && (
					<a href={feature.screenshot} className="flex-self-center">
						<img
							src={feature.screenshot}
							className="d-block border"
							style={{
								maxHeight: 100,
								maxWidth: 150,
							}}/>
					</a>
				)}
			</div>
		</div>,
	);

	// Skip dev check present in `getLocalHotfixes`, we want to see this even when developing
	const hotfixes = await cache.get<HotfixStorage>('hotfixes:') ?? [];

	const hotfixed = hotfixes.find(([feature]) => feature === currentFeatureName);
	if (!hotfixed) {
		return;
	}

	const [_name, issue, unaffectedVersion] = hotfixed;

	infoBanner.before(
		<div className="mb-3 d-inline-block width-full flash flash-warn mb-2">
			<strong>Note:</strong> This feature is disabled due to {createRghIssueLink(issue)}
			{unaffectedVersion && ` until version ${unaffectedVersion}`}
		</div>,
	);
}

function init(signal: AbortSignal): void {
	observe('#repos-sticky-header', add, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		pageDetect.isSingleFile,
	],
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.tsx
- https://github.com/refined-github/refined-github/blob/main/source/features/clean-conversation-sidebar.css

*/
