import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function handleMenuOpening(event: DelegateEvent): void {
	const dropdown = event.delegateTarget.nextElementSibling!;

	// Only if it's not already there
	if (select.exists('.rgh-actionable-link', dropdown)) {
		return;
	}

	// Only enabled on Open/Draft PRs. Editing files doesn't make sense after a PR is closed/merged.
	if (!select.exists('.gh-header-meta [title$="Open"], .gh-header-meta [title$="Draft"]')) {
		return;
	}

	// If you're viewing changes from partial commits, ensure you're on the latest one.
	const isPartialCommits = select.exists('.js-commits-filtered');
	if (isPartialCommits && !select.exists('[aria-label="You are viewing the latest commit"]')) {
		return;
	}

	// Looks like `https://github.com/kidonng/refined-github/tree/fix-console-error`
	const headReferenceLink = select<HTMLAnchorElement>('.head-ref a')!;
	const branchPathnameParts = headReferenceLink.pathname.split('/');
	branchPathnameParts[3] = 'blob'; // This replaces `tree`
	branchPathnameParts[4] = headReferenceLink.title.replace(/^[^:]+:/, ''); // Ensures that the branch name is attached even when it links to the default branch

	// Looks like `https://github.com/sindresorhus/refined-github/blob/cddac8d7e158c336552aa694a4698d4764754b64/source/features/embed-gist-via-iframe.tsx`
	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const viewFilePathnameParts = viewFile.pathname.split('/');
	viewFilePathnameParts.splice(0, 5, ...branchPathnameParts); // Replaces `user/repo/blob/sha` with `forkuser/repo/blob/branch`
	viewFile.pathname = viewFilePathnameParts.join('/');
}

function init(): void {
	delegate('#files', '.js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Points the "View file" in PRs to the branch instead of the commit, so the Edit/Delete buttons will be enabled on the "View file" page, if needed.',
	screenshot: '',
	include: [
		features.isPRFiles,
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
