import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

const deploymentSelector = '.js-timeline-item [data-url$="deployed"] .TimelineItem-body .btn[target="_blank"]';

function init(): void {
	const {href} = select.last<HTMLAnchorElement>(deploymentSelector)!;
	select('.gh-header-actions')!.prepend(
		<a
			className="btn btn-sm btn-outline mr-1"
			href={href}
			target="_blank"
			rel="noreferrer"
		>
			View Deployment <LinkExternalIcon className="ml-1"/>
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		() => !select.exists(deploymentSelector)
	],
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init);
	}
});
