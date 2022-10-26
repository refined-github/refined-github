import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GlobeIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

const deploymentSelector = '.js-timeline-item [data-url$="deployed"] .TimelineItem-body .btn[target="_blank"]';

function init(): void {
	if (select.exists('.rgh-last-deployment')) {
		return;
	}

	const {href} = select.last<HTMLAnchorElement>(deploymentSelector)!;
	select('.gh-header-actions')!.prepend(
		<a
			className="rgh-last-deployment btn btn-sm d-none d-md-block mr-1"
			href={href}
		>
			<GlobeIcon className="mr-1"/> View deployment
		</a>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		() => select.exists(deploymentSelector),
	],
	include: [
		pageDetect.isPRConversation,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
