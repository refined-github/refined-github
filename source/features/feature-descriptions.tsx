import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCleanPathname, getCurrentBranch, getRepositoryInfo} from '../github-helpers';

function toggleHandler({delegateTarget: button}: delegate.Event): void {
	const isHidden = select('.rgh-feature-screenshot')!.classList.toggle('d-none');
	if (isHidden) {
		button.textContent = 'View Screenshot';
	} else {
		button.textContent = 'Hide Screenshot';
	}
}

async function init(): Promise<void | false> {
	const currentFeature = location.pathname.split('/').pop()!.replace(/.tsx|.css/, '');
	const currentFeatureInformation = features.allFeatures.find(feature => feature.id === currentFeature)!;
	if (!currentFeatureInformation) {
		return false;
	}

	const branchSelector = await elementReady('[data-hotkey="w"]')!;
	branchSelector!.closest('.d-flex')!.after(
		<div className="Box mb-3">
			<div className="Box-row d-flex flex-items-center">
				<div className="flex-auto">
					<strong>{currentFeatureInformation.id}</strong>
					<div className="text-small text-gray-light">
						{currentFeatureInformation.description}
					</div>
				</div>
				{
					currentFeatureInformation.screenshot &&
						<button
							type="button"
							className="btn btn-primary rgh-toggle-feature-screenshot"
							name="button"
						>
							View Screenshot
						</button>
				}
			</div>
			<div className="Box-row d-flex flex-items-center rgh-feature-screenshot d-none">
				<div className="flex-auto">
					<a target="_blank" rel="noopener noreferrer" href={currentFeatureInformation.screenshot}>
						<img className="width-fit" src={currentFeatureInformation.screenshot}/>
					</a>
				</div>
			</div>
		</div>
	);

	delegate(document, '.rgh-toggle-feature-screenshot', 'click', toggleHandler);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile
	],
	exclude: [
		() => !getCleanPathname().startsWith(`${getRepositoryInfo().owner!}/refined-github/blob/${getCurrentBranch()!}/source/features/`)
	],
	awaitDomReady: false,
	init
});
