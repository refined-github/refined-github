import select from 'select-dom';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

function clearField(): void {
	const messageField = select<HTMLTextAreaElement>('#merge_message_field')!;

	const coAuthorsMatches = messageField.value.matchAll(/Co-Authored-By: [^\n]+/g);

	// Deduplicate Co-Authors
	const coAuthors = [...new Set([...coAuthorsMatches].flat())];

	messageField.value = coAuthors.join('\n');
}

function init(): void {
	onPrMergePanelOpen(clearField);
}

features.add({
	id: __featureName__,
	description: 'Clears the PR merge commit message of clutter, leaving only deduplicated co-authors.'
}, {
	include: [
		features.isPRConversation
	],
	load: features.onDocumentStart,
	init
});
