import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import attachElement from '../helpers/attach-element';

function init(): void | false {
	const lastDeployment = select.last<HTMLAnchorElement>('.js-timeline-item a[title="Deployment has completed"]');
	if (!lastDeployment) {
		return false;
	}

	attachElement('.gh-header-actions', {
		prepend: () => (
			<a
				className="rgh-last-deployment btn btn-sm d-none d-md-block mr-1"
				target="_blank" // Matches GitHub’s own behavior
				rel="noopener noreferrer"
				href={lastDeployment.href}
			>
				<LinkExternalIcon className="mr-1"/> Last deployment
			</a>
		)
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: '.rgh-last-deployment',
	init,
});
