import './rgh-feature-descriptions.css';
import React from 'dom-chef';
import {AlertIcon, CopyIcon, InfoIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import {featuresMeta} from '../../readme.md';
import optionsStorage, {getNewFeatureName, isFeatureDisabled} from '../options-storage.js';
import observe from '../helpers/selector-observer.js';
import {brokenFeatures} from '../helpers/hotfix.js';
import {createRghIssueLink} from '../helpers/rgh-issue-link.js';
import openOptions from '../helpers/open-options.js';
import createBanner from '../github-helpers/banner.js';
import {isFeaturePrivate} from '../helpers/feature-utils.js';

function addDescription(infoBanner: HTMLElement, id: string, meta: FeatureMeta | undefined): void {
	const isCss = location.pathname.endsWith('.css');

	const description = meta?.description // Regular feature?
	?? (
		isFeaturePrivate(id)
			? 'This feature applies only to "Refined GitHub" repositories and cannot be disabled.'
			: (
				isCss
					? 'This feature is CSS-only and cannot be disabled.'
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
							meta && isCss
								? <> • <a data-turbo-frame="repo-content-turbo-frame" href={location.pathname.replace('.css', '.tsx')}>See .tsx file</a></>
								: undefined
						}
					</div>
				</div>
				{meta?.screenshot && (
					<a href={meta.screenshot} className="flex-self-center">
						<img
							src={meta.screenshot}
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
}

async function getDisabledReason(id: string): Promise<JSX.Element | undefined> {
	const classes = ['mb-3'];
	// Skip dev check present in `getLocalHotfixes`, we want to see this even when developing
	const hotfixes = await brokenFeatures.get() ?? [];
	const hotfixed = hotfixes.find(([feature]) => feature === id);
	if (hotfixed) {
		const [_name, issue, unaffectedVersion] = hotfixed;

		if (unaffectedVersion) {
			return createBanner({
				text: <>This feature was disabled until version {unaffectedVersion} due to {createRghIssueLink(issue)}.</>,
				classes,
				icon: <InfoIcon className="mr-0"/>,
			});
		}

		return createBanner({
			text: <>This feature is disabled due to {createRghIssueLink(issue)}.</>,
			classes: [...classes, 'flash-warn'],
			icon: <AlertIcon className="mr-0"/>,
		});
	}

	if (isFeatureDisabled(await optionsStorage.getAll(), id)) {
		return createBanner({
			text: <>This feature is disabled on GitHub.com <button className="btn-link" type="button" onClick={openOptions as unknown as React.MouseEventHandler}>in your options</button>.</>,
			classes: [...classes, 'flash-warn'],
			icon: <AlertIcon className="mr-0"/>,
		});
	}

	return undefined;
}

async function addDisabledBanner(infoBanner: HTMLElement, id: string): Promise<void> {
	const reason = await getDisabledReason(id);
	if (reason) {
		infoBanner.before(reason);
	}
}

async function add(infoBanner: HTMLElement): Promise<void> {
	const [, filename] = /source\/features\/([^.]+)/.exec(location.pathname) ?? [];
	// Enable link even on past commits
	const currentFeatureName = getNewFeatureName(filename);
	const meta = featuresMeta.find(feature => feature.id === currentFeatureName);

	// This ID exists whether the feature is documented or not
	const id = meta?.id ?? filename;

	addDescription(infoBanner, id, meta);
	await addDisabledBanner(infoBanner, id);
}

function init(signal: AbortSignal): void {
	observe('#repos-sticky-header', add, {signal});
}

// eslint-disable-next-line unicorn/better-regex -- No "\/"
const featureUrlRegex = /^([/]refined-github){2}[/]blob[/][^/]+[/]source[/]features[/][^.]+[.](tsx|css)$/;

void features.add(import.meta.url, {
	include: [
		() => featureUrlRegex.test(location.pathname),
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
