import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

function init(): void {
	const messageField = select<HTMLTextAreaElement>('#merge_message_field')!;

	const coAuthorsMatches = messageField.value.matchAll(/Co-Authored-By: [^\n]+/g);
	const coAuthors = [...new Set([...coAuthorsMatches].flat())]; // Deduplicate Co-Authors

	messageField.value = coAuthors.join('\n');
}

features.add({
	id: __filebasename,
	description: 'Clears the PR merge commit message of clutter, leaving only deduplicated co-authors.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/79257078-62b6fc00-7e89-11ea-8798-c06f33baa94b.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		onPrMergePanelOpen
	],
	onlyAdditionalListeners: true,
	waitForDomReady: false,
	init
});
