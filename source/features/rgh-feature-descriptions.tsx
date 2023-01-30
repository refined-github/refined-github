import './rgh-feature-descriptions.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {featuresMeta} from '../../readme.md';
import {getNewFeatureName} from '../options-storage';
import {isRefinedGitHubRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

async function add(infoBanner: HTMLElement): Promise<void> {
	console.log(infoBanner);

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
		<div className="Box mb-3">
			<div className="Box-row d-flex gap-3 flex-wrap">
				<div className="rgh-feature-description">
					{ /* eslint-disable-next-line react/no-danger */ }
					<h3 dangerouslySetInnerHTML={{__html: feature.description}}/>
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
	awaitDomReady: false,
	init,
});
