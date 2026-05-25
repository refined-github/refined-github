import './rgh-feature-descriptions.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import AlertIcon from 'octicons-plain-react/Alert';
import CopyIcon from 'octicons-plain-react/Copy';
import InfoIcon from 'octicons-plain-react/Info';
import {$} from 'select-dom';

import {mount} from 'svelte';

import {featuresMeta, getNewFeatureName, getOldFeatureNames} from '../feature-data.js';
import features from '../feature-manager.js';
import createBanner from '../github-helpers/banner.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import {isFeaturePrivate} from '../helpers/feature-utils.js';
import {brokenFeatures} from '../helpers/hotfix.js';
import joinJsx from '../helpers/join-jsx.js';
import openOptions from '../helpers/open-options.js';
import RelatedIssuesCount from '../helpers/related-issues-count.svelte';
import {createRghIssueLink} from '../helpers/rgh-links.js';
import observe from '../helpers/selector-observer.js';
import optionsStorage, {isFeatureDisabled} from '../options-storage.js';

function getLinksElement(id: string, meta: FeatureMeta | undefined, featurePathname: string): JSX.Element {
	const wasFeatureRemoved = !meta && !isFeaturePrivate(id);
	const isCss = featurePathname.endsWith('.css');
	const tsxPathname = isCss ? featurePathname.replace('.css', '.tsx') : featurePathname;
	const cssPathname = isCss ? featurePathname : featurePathname.replace('.tsx', '.css');

	const links = [];

	const relatedIssuesContainer = <span />;
	mount(RelatedIssuesCount, {
		target: relatedIssuesContainer,
		props: {
			featureId: id,
		},
	});
	links.push(relatedIssuesContainer);

	if (!wasFeatureRemoved) {
		const newIssueUrl = new URL('https://github.com/refined-github/refined-github/issues/new');
		newIssueUrl.searchParams.set('template', '1_bug_report.yml');
		newIssueUrl.searchParams.set('title', `\`${id}\` `);
		newIssueUrl.searchParams.set('labels', 'bug, help wanted');
		links.push(
			<a data-turbo-frame="repo-content-turbo-frame" href={newIssueUrl.href}>Report bug</a>,
		);
	}

	if (meta) {
		if (isCss && !meta.cssOnly) {
			links.push(
				<a data-turbo-frame="repo-content-turbo-frame" href={tsxPathname}>See .tsx file</a>,
			);
		} else if (meta.css && !isCss) {
			links.push(
				<a data-turbo-frame="repo-content-turbo-frame" href={cssPathname}>See .css file</a>,
			);
		}
	}

	if (wasFeatureRemoved) {
		links.push(
			// This links to the full commit history, which will start with the commit that removed the file
			<a
				data-turbo-frame="repo-content-turbo-frame"
				href={`https://github.com/refined-github/refined-github/commits/main/source/features/${id}.tsx`}
			>
				Commit history
			</a>,
		);
	}

	return <div className="no-wrap">{joinJsx(' • ', links)}</div>;
}

function addDescription(infoBanner: HTMLElement, id: string, meta: FeatureMeta | undefined, featurePathname: string): void {
	const description = meta
		? meta.description + (meta.cssOnly ? ' This feature is CSS-only and cannot be disabled.' : '')
		: (
			isFeaturePrivate(id)
				? 'This feature applies only to "Refined GitHub" repositories and cannot be disabled.'
				: undefined // The heck!?
		);

	const oldNames = getOldFeatureNames(id);

	infoBanner.before(
		// Block and width classes required to avoid margin collapse
		<div className="Box mb-3 tmp-mb-3 d-inline-block width-full">
			<div className="Box-row d-flex gap-3 flex-wrap">
				<div className="rgh-feature-description d-flex flex-column gap-2">
					<h3>
						{
							description
								? <>
									<code>{id}</code>
									<clipboard-copy
										aria-label="Copy"
										data-copy-feedback="Copied!"
										value={id}
										class="Link--onHover color-fg-muted d-inline-block ml-2"
										tabindex="0"
										role="button"
									>
										<CopyIcon className="v-align-baseline" />
									</clipboard-copy>
								</>
								: <span className="color-fg-muted">
									This feature is no longer part of Refined GitHub.
								</span>
						}
					</h3>
					{oldNames.length > 0 && (
						<div className="color-fg-muted mt-n3 tmp-mt-n3">
							<span className="text-small">previously named </span>
							{oldNames.map((name, index) => (
								<React.Fragment key={name}>
									{index > 0 && ', '}
									<code>{name}</code>
								</React.Fragment>
							))}
						</div>
					)}
					{description && <div dangerouslySetInnerHTML={{__html: description}} className="h3" />}
					{getLinksElement(id, meta, featurePathname)}
				</div>
				{/* eslint-disable-next-line refined-github/no-optional-chaining -- Undocumented feature, no meta */}
				{meta?.screenshot && (
					<a href={meta.screenshot} className="flex-self-center">
						<img
							src={meta.screenshot}
							className="d-block border"
							style={{
								maxHeight: 100,
								maxWidth: 150,
							}}
						/>
					</a>
				)}
			</div>
		</div>,
	);
}

async function getDisabledReason(id: string): Promise<JSX.Element | undefined> {
	// Block and width classes required to avoid margin collapse
	const classes = ['mb-3', 'd-inline-block', 'width-full'];
	// Skip dev check present in `getLocalHotfixes`, we want to see this even when developing
	const hotfixes = await brokenFeatures.get() ?? [];
	const hotfixed = hotfixes.find(([feature]) => feature === id);
	if (hotfixed) {
		const [_name, issue, unaffectedVersion] = hotfixed;

		if (unaffectedVersion) {
			return createBanner({
				text: <>This feature was disabled until version {unaffectedVersion} due to {createRghIssueLink(issue)}.</>,
				classes,
				icon: <InfoIcon className="mr-0 tmp-mr-0" />,
			});
		}

		return createBanner({
			text: <>This feature is disabled due to {createRghIssueLink(issue)}.</>,
			classes: [...classes, 'flash-warn'],
			icon: <AlertIcon className="mr-0 tmp-mr-0" />,
		});
	}

	if (isFeatureDisabled(await optionsStorage.getAll(), id)) {
		return createBanner({
			text: 'You disabled this feature on GitHub.com.',
			classes: [...classes, 'flash-warn'],
			icon: <AlertIcon className="mr-0 tmp-mr-0" />,
			action(event) {
				openOptions(event, id);
			},
			buttonLabel: 'Refined GitHub Options',
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

async function addFeatureInformationWidget(
	infoBanner: HTMLElement,
	featureName: string,
	featurePathname = `/refined-github/refined-github/blob/main/source/features/${featureName}.tsx`,
): Promise<void> {
	// Enable link even on past commits
	const currentFeatureName = getNewFeatureName(featureName) ?? featureName;
	const meta = featuresMeta.find(feature => feature.id === currentFeatureName);

	// This ID exists whether the feature is documented or not
	const id = meta?.id ?? currentFeatureName;

	addDescription(infoBanner, id, meta, featurePathname);
	await addDisabledBanner(infoBanner, id);
}

async function add(infoBanner: HTMLElement): Promise<void> {
	const [, filename] = /source\/features\/([^.]+)/.exec(location.pathname) ?? [];
	if (filename) {
		await addFeatureInformationWidget(infoBanner, filename, location.pathname);
	}
}

function getFeatureNameFromIssueTitle(): string | undefined {
	const title = new URL(location.href).searchParams.get('title');
	const match = /^`([^`]+)`/.exec(title ?? '');
	return match ? match[1] : undefined;
}

async function addOnIssueForm(mainContent: HTMLElement | SVGElement): Promise<void> {
	if (!(mainContent instanceof HTMLElement)) {
		return;
	}

	const featureName = getFeatureNameFromIssueTitle();
	const formContainer = mainContent.parentElement;
	if (!featureName || (formContainer && $('.rgh-feature-description', formContainer))) {
		return;
	}

	await addFeatureInformationWidget(mainContent, featureName);
}

const featureUrlRegex = /^(?:[/]refined-github){2}[/]blob[/][^/]+[/]source[/]features[/][^.]+[.](?:tsx|css)$/;

function init(signal: AbortSignal): void {
	if (featureUrlRegex.test(location.pathname)) {
		observe('#repos-sticky-header', add, {signal});
	}

	if (isRefinedGitHubRepo() && pageDetect.isNewIssue() && new URL(location.href).searchParams.get('template') === '1_bug_report.yml') {
		observe('[class^="CreateIssueForm-module__mainContentSection"]', addOnIssueForm, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		() => featureUrlRegex.test(location.pathname),
		() => isRefinedGitHubRepo() && pageDetect.isNewIssue() && new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	init,
});

/*

## Test URLs

- Regular feature: https://github.com/refined-github/refined-github/blob/main/source/features/align-issue-labels.tsx
- CSS counterpart: https://github.com/refined-github/refined-github/blob/main/source/features/align-issue-labels.css
- RGH feature: https://github.com/refined-github/refined-github/blob/main/source/features/rgh-feature-descriptions.css
- CSS-only feature: https://github.com/refined-github/refined-github/blob/main/source/features/reactions-popup.css
- Removed feature" https://github.com/refined-github/refined-github/blob/55dfdfd903bd7d36e0c2f3dc46847bddc73544f5/source/features/latest-tag-button.tsx
*/
