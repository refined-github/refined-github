import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {wrapAll} from '../helpers/dom-utils';
import {featuresMeta} from '../../readme.md';
import {getNewFeatureName} from '../options-storage';
import {isRefinedGitHubRepo} from '../github-helpers';

async function init(): Promise<void | false> {
	const [, currentFeature] = /source\/features\/([^.]+)/.exec(location.pathname) ?? [];
	// Enable link even on past commits
	const currentFeatureName = getNewFeatureName(currentFeature);
	const feature = featuresMeta.find(feature => feature.id === currentFeatureName);
	if (!feature) {
		return false;
	}

	const conversationsUrl = new URL('https://github.com/refined-github/refined-github/issues');
	conversationsUrl.searchParams.set('q', `sort:updated-desc "${feature.id}"`);

	const commit = await elementReady([
		'.Box-header.Details', // Already loaded
		'include-fragment.commit-loader', // Deferred loading
	].join(','));

	const commitInfoBox = commit!.parentElement!;

	commitInfoBox.classList.add('width-fit', 'min-width-0', 'flex-auto', 'mb-lg-0', 'mr-lg-3');
	commitInfoBox.classList.remove('flex-shrink-0');

	const featureInfoBox = (
		<div className="Box rgh-feature-description" style={{flex: '0 1 544px'}}>
			<div className="Box-row d-flex height-full">
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
				<div className={'flex-auto' + (feature.screenshot ? ' ml-3' : '')}>
					{ /* eslint-disable-next-line react/no-danger */ }
					<div dangerouslySetInnerHTML={{__html: feature.description}} className="text-bold"/>
					<div className="no-wrap">
						<a href={conversationsUrl.href} data-pjax="#repo-content-pjax-container">Conversations</a>
					</div>
				</div>
			</div>
		</div>
	);

	wrapAll([commitInfoBox, featureInfoBox], <div className="d-lg-flex"/>);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	deduplicate: '.rgh-feature-description', // #3945
	init,
});
