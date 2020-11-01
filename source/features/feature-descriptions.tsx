import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCleanPathname, getCurrentBranch, getRepositoryInfo, upperCaseFirst} from '../github-helpers';

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
	const featureInfo = __featuresMeta__.find(feature => feature.id === currentFeature)!;
	if (!featureInfo) {
		return false;
	}

	const branchSelector = await elementReady('[data-hotkey="w"]')!;
	branchSelector!.closest('.d-flex')!.after(
		<div className="Box mb-3">
			<div className="Box-row d-flex flex-items-center">
				<div className="flex-auto">
					<strong>{upperCaseFirst(featureInfo.id.replace(/-/g, ' '))}</strong>
					<div className="text-small text-gray-light">
						{featureInfo.description}
					</div>
				</div>
				{
					featureInfo.screenshot &&
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
					<a href={featureInfo.screenshot}>
						<img className="width-fit" src={featureInfo.screenshot}/>
					</a>
				</div>
			</div>
		</div>
	);

	delegate(document, '.rgh-toggle-feature-screenshot', 'click', toggleHandler);
}

void features.add(__filebasename, {
	include: [
		() => /refined-github\/blob\/\w+\/source\/features\/[\w.-]+$/.test(location.pathname)
	],
	awaitDomReady: false,
	init
});
