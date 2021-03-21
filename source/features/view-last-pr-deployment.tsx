import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '.';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

const deploymentSelector = '.js-timeline-item [data-url$="deployed"] .TimelineItem-body .btn[target="_blank"]';

function init(): void {
	if (select.exists('.rgh-last-deployment')) {
		return;
	}

	const {href} = select.last<HTMLAnchorElement>(deploymentSelector)!;
	select('.gh-header-actions')!.prepend(
		<a
			className="rgh-last-deployment btn btn-sm mr-1"
			href={href}
			target="_blank"
			rel="noreferrer"
		>
			<LinkExternalIcon className="mr-1"/> View deployment
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
	additionalListeners: [
		onConversationHeaderUpdate
	],
	init
});
