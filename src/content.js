import 'webext-dynamic-content-scripts';
import onAjaxedPages from 'github-injection';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import select from 'select-dom';
import domLoaded from 'dom-loaded';

import markUnread from './features/mark-unread';
import addOpenAllNotificationsButton from './features/open-all-notifications';
import addUploadBtn from './features/upload-button';
import enableCopyOnY from './features/copy-on-y';
import addReactionParticipants from './features/reactions-avatars';
import showRealNames from './features/show-names';
import addCopyFilePathToPRs from './features/copy-file-path';
import addFileCopyButton from './features/copy-file';
// - import copyMarkdown from './features/copy-markdown';
import linkifyCode from './features/linkify-urls-in-code';
import autoLoadMoreNews from './features/auto-load-more-news';
import addOPLabels from './features/op-labels';
import addMoreDropdown from './features/more-dropdown';
import addReleasesTab from './features/add-releases-tab';
import addTimeMachineLinksToComments from './features/add-time-machine-links-to-comments';
import removeUploadFilesButton from './features/remove-upload-files-button';
import scrollToTopOnCollapse from './features/scroll-to-top-on-collapse';
import removeDiffSigns from './features/remove-diff-signs';
import * as linkifyBranchRefs from './features/linkify-branch-refs';
import hideEmptyMeta from './features/hide-empty-meta';
import hideOwnStars from './features/hide-own-stars';
import moveMarketplaceLinkToProfileDropdown from './features/move-marketplace-link-to-profile-dropdown';
import addTrendingMenuItem from './features/add-trending-menu-item';
import addProfileHotkey from './features/add-profile-hotkey';
import addYoursMenuItem from './features/add-yours-menu-item';
import addReadmeButtons from './features/add-readme-buttons';
import addDeleteForkLink from './features/add-delete-fork-link';
import linkifyIssuesInTitles from './features/linkify-issues-in-titles';
import addPatchDiffLinks from './features/add-patch-diff-links';
import markMergeCommitsInList from './features/mark-merge-commits-in-list';
import showRecentlyPushedBranches from './features/show-recently-pushed-branches';
import addDiffViewWithoutWhitespaceOption from './features/add-diff-view-without-whitespace-option';
import preserveWhitespaceOptionInNav from './features/preserve-whitespace-option-in-nav';
import addMilestoneNavigation from './features/add-milestone-navigation';
import addFilterCommentsByYou from './features/add-filter-comments-by-you';
import addProjectNewLink from './features/add-project-new-link';
import removeProjectsTab from './features/remove-projects-tab';
import fixSquashAndMergeTitle from './features/fix-squash-and-merge-title';
import addTitleToEmojis from './features/add-title-to-emojis';
import sortMilestonesByClosestDueDate from './features/sort-milestones-by-closest-due-date';
import moveAccountSwitcherToSidebar from './features/move-account-switcher-to-sidebar';
import openCIDetailsInNewTab from './features/open-ci-details-in-new-tab';
import focusConfirmationButtons from './features/focus-confirmation-buttons';
import addKeyboardShortcutsToCommentFields from './features/add-keyboard-shortcuts-to-comment-fields';
import addConfirmationToCommentCancellation from './features/add-confirmation-to-comment-cancellation';
import addCILink from './features/add-ci-link';

import * as pageDetect from './libs/page-detect';
import {observeEl, safeElementReady, safely} from './libs/utils';

// Add globals for easier debugging
window.$ = $;
window.select = select;

async function init() {
	await safeElementReady('body');
	if (document.body.classList.contains('logged-out')) {
		return;
	}

	if (select.exists('html.refined-github')) {
		console.error(`
❤️💛💚💙💜❤️💛💚💙💜❤️💛💚💙💜❤️💛💚💙💜
Minor bug in Refined GitHub, but we need your help to fix it:
https://github.com/sindresorhus/refined-github/issues/565

We'll need to know:

1. Are you running two extensions at once? Chrome Web Store + development. If so, just disable one of them.
2. Are you on GitHub Enteprise?
3. The content of the console of this page.
4. The content of the console of the background page after enabling the Developer mode in the Extensions page: https://i.imgur.com/zjIngb4.png

Thank you! 🎉
❤️💛💚💙💜❤️💛💚💙💜❤️💛💚💙💜❤️💛💚💙💜`);
		return;
	}

	document.documentElement.classList.add('refined-github');

	if (!pageDetect.isGist()) {
		safely(addTrendingMenuItem);
	}

	if (pageDetect.isDashboard()) {
		safely(moveAccountSwitcherToSidebar);
	}

	safely(focusConfirmationButtons);
	safely(addKeyboardShortcutsToCommentFields);
	safely(addConfirmationToCommentCancellation);
	});


	// TODO: Enable this when we've improved how copying Markdown works
	// See #522
	// $(document).on('copy', '.markdown-body', copyMarkdown);

	domLoaded.then(onDomReady);
}

function onDomReady() {
	safely(markUnread.setup);
	safely(addOpenAllNotificationsButton);
	safely(addProfileHotkey);

	if (!pageDetect.isGist()) {
		safely(moveMarketplaceLinkToProfileDropdown);
	}

	if (pageDetect.isGist()) {
		safely(addFileCopyButton);
	}

	if (pageDetect.isDashboard()) {
		safely(hideOwnStars);
		safely(autoLoadMoreNews);
	}

	onAjaxedPages(ajaxedPagesHandler);
}

function ajaxedPagesHandler() {
	safely(hideEmptyMeta);
  safely(removeUploadFilesButton);
	safely(addTitleToEmojis);
	safely(enableCopyOnY.destroy);

	safely(() => {
		for (const a of select.all('a[href]')) {
			shortenLink(a, location.href);
		}
	});

	safely(linkifyCode); // Must be after link shortening #789

	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
		safely(addYoursMenuItem);
	}

	if (pageDetect.isMilestone()) {
		safely(addMilestoneNavigation); // Needs to be before sortMilestonesByClosestDueDate
	}

	if (pageDetect.isRepo()) {
		safely(addMoreDropdown);
		safely(addReleasesTab);
		safely(removeProjectsTab);
		safely(addReadmeButtons);
		safely(addDiffViewWithoutWhitespaceOption);
		safely(removeDiffSigns);
		safely(addCILink);
		safely(sortMilestonesByClosestDueDate); // Needs to be after addMilestoneNavigation
	}

	if (pageDetect.isPR()) {
		safely(scrollToTopOnCollapse);
		safely(linkifyBranchRefs.inPR);
		safely(addDeleteForkLink);
		safely(fixSquashAndMergeTitle);
		safely(openCIDetailsInNewTab);
	}

	if (pageDetect.isQuickPR()) {
		safely(linkifyBranchRefs.inQuickPR);
	}

	if (pageDetect.isPR() || pageDetect.isIssue()) {
		safely(linkifyIssuesInTitles);
		safely(addUploadBtn);

		observeEl('.new-discussion-timeline', () => {
			safely(addOPLabels);
			safely(addTimeMachineLinksToComments);
		});
	}

	if (pageDetect.isPRList() || pageDetect.isIssueList()) {
		safely(addFilterCommentsByYou);
		safely(showRecentlyPushedBranches);
	}

	if (pageDetect.isCommit()) {
		safely(addPatchDiffLinks);
	}

	if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
		safely(addReactionParticipants);
		safely(showRealNames);
	}

	if (pageDetect.isCommitList()) {
		safely(markMergeCommitsInList);
	}

	if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
		safely(addCopyFilePathToPRs);
		safely(preserveWhitespaceOptionInNav);
	}

	if (pageDetect.isSingleFile()) {
		safely(addFileCopyButton);
		safely(enableCopyOnY.setup);
	}

	if (pageDetect.isRepoSettings()) {
		safely(addProjectNewLink);
	}
}

init();
