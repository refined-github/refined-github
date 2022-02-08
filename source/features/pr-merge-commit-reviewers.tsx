import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

function init(): void {
	const messageField = select('textarea#merge_message_field')!;

	if (messageField.value.includes('Approved by')) {
		return;
	}

	const reviewers = select.all('span.reviewers-status-icon');
	const message = ['Approved by:'];

	for (const reviewer of reviewers) {
		if (!reviewer.hasAttribute('aria-label')) {
			continue;
		}

		const label = reviewer.getAttribute('aria-label');
		if (label!.includes('approved these changes')) {
			const name = label!.split(' ')[0];
			message.push(name);
		}
	}

	if (messageField.value.length > 0) {
		messageField.value += '\n';
	}

	messageField.value += message.join(' ');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	additionalListeners: [
		onPrMergePanelOpen,
	],
	onlyAdditionalListeners: true,
	deduplicate: 'has-rgh-inner',
	init,
});
