import './rgh-feature-descriptions.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {CopyIcon} from '@primer/octicons-react';
import cache from 'webext-storage-cache';

import features from '../feature-manager.js';
import {featuresMeta} from '../../readme.md';
import {getNewFeatureName} from '../options-storage.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {HotfixStorage} from '../helpers/hotfix.js';
import {createRghIssueLink} from '../helpers/rgh-issue-link.js';

async function add(infoBanner: HTMLElement): Promise<void> {
	const [, currentFeature] = /source\/features\/([^.]+)/.exec(location.pathname) ?? [];
	// Enable link even on past commits
	const currentFeatureName = getNewFeatureName(currentFeature);
	const feature = featuresMeta.find(feature => feature.id === currentFeatureName);

	// This ID exists whether the feature is documented or not
	const id = feature?.id ?? currentFeature;

	const isCss = location.pathname.endsWith('.css');
	const isPrivateFeature = id.startsWith('rgh-');

	const description = feature?.description // Regular feature?
	?? (
		isPrivateFeature
			? 'This feature applies only to "Refined GitHub" repositories and cannot be disabled'
			: (
				isCss
					? 'This feature is CSS-only cannot be disabled'
					: undefined // The heck!?
			)
	);

	const conversationsUrl = new URL('https://github.com/refined-github/refined-github/issues');
	conversationsUrl.searchParams.set('q', `sort:updated-desc is:open "${id}"`);

	const newIssueUrl = new URL('https://github.com/refined-github/refined-github/issues/new');
	newIssueUrl.searchParams.set('template', '1_bug_report.yml');
	newIssueUrl.searchParams.set('title', `\`${id}\`: `);

	infoBanner.before(
		// Block and width classes required to avoid margin collapse
		<div className="Box mb-3 d-inline-block width-full">
			<div className="Box-row d-flex gap-3 flex-wrap">
				<div className="rgh-feature-description d-flex flex-column gap-2">
					<h3>
						<code>{id}</code>
						<clipboard-copy
							aria-label="Copy"
							data-copy-feedback="Copied!"
							value={id}
							class="Link--onHover color-fg-muted d-inline-block ml-2"
							tabindex="0"
							role="button"
						>
							<CopyIcon className="v-align-baseline"/>
						</clipboard-copy>
					</h3>
					{ /* eslint-disable-next-line react/no-danger */ }
					{description && <div dangerouslySetInnerHTML={{__html: description}} className="h3"/>}
					<div className="no-wrap">
						<a href={conversationsUrl.href} data-turbo-frame="repo-content-turbo-frame">Related issues</a>
						{' • '}
						<a href={newIssueUrl.href} data-turbo-frame="repo-content-turbo-frame">Report bug</a>
						{
							feature && isCss
								? <> • <a data-turbo-frame="repo-content-turbo-frame" href={location.pathname.replace('.css', '.tsx')}>See .tsx file</a></>
								: undefined
						}
					</div>
				</div>
				{feature?.screenshot && (
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

- Regular feature: https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.tsx
- CSS counterpart: https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.css
- RGH feature: https://github.com/refined-github/refined-github/blob/main/source/features/rgh-feature-descriptions.css
- CSS-only feature: https://github.com/refined-github/refined-github/blob/main/source/features/center-reactions-popup.css
*/
