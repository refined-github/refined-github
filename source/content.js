import 'webext-dynamic-content-scripts';
import onAjaxedPages from 'github-injection';
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
import autoLoadContributionActivities from './features/auto-load-contribution-activities';
import addOPLabels from './features/op-labels';
import addMoreDropdown from './features/more-dropdown';
import addReleasesTab from './features/add-releases-tab';
import addGistsLink from './features/add-gists-link-to-profile';
import addTimeMachineLinksToComments from './features/add-time-machine-links-to-comments';
import removeUploadFilesButton from './features/remove-upload-files-button';
import scrollToTopOnCollapse from './features/scroll-to-top-on-collapse';
import removeDiffSigns from './features/remove-diff-signs';
import linkifyBranchRefs from './features/linkify-branch-refs';
import hideEmptyMeta from './features/hide-empty-meta';
import hideOwnStars from './features/hide-own-stars';
import moveMarketplaceLinkToProfileDropdown from './features/move-marketplace-link-to-profile-dropdown';
import addYourRepoLinkToProfileDropdown from './features/add-your-repositories-link-to-profile-dropdown';
import addTrendingMenuItem from './features/add-trending-menu-item';
import addProfileHotkey from './features/add-profile-hotkey';
import addYoursMenuItem from './features/add-yours-menu-item';
import addCommentedMenuItem from './features/add-commented-menu-item';
import addToggleFilesButton from './features/add-toggle-files-button';
import addReadmeButtons from './features/add-readme-buttons';
import addBranchButtons from './features/add-branch-buttons';
import addDeleteForkLink from './features/add-delete-fork-link';
import linkifyIssuesInTitles from './features/linkify-issues-in-titles';
import addPatchDiffLinks from './features/add-patch-diff-links';
import markMergeCommitsInList from './features/mark-merge-commits-in-list';
import showRecentlyPushedBranches from './features/show-recently-pushed-branches';
import addDiffViewWithoutWhitespaceOption from './features/add-diff-view-without-whitespace-option';
import preserveWhitespaceOptionInNav from './features/preserve-whitespace-option-in-nav';
import addMilestoneNavigation from './features/add-milestone-navigation';
import addFilterCommentsByYou from './features/add-filter-comments-by-you';
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
import embedGistInline from './features/embed-gist-inline';
import extendIssueStatusLabel from './features/extend-issue-status-label';
import highlightClosingPrsInOpenIssues from './features/highlight-closing-prs-in-open-issues';
import toggleAllThingsWithAlt from './features/toggle-all-things-with-alt';
import addJumpToBottomLink from './features/add-jump-to-bottom-link';
import addQuickReviewButtons from './features/add-quick-review-buttons';
import extendDiffExpander from './features/extend-diff-expander';
import sortIssuesByUpdateTime from './features/sort-issues-by-update-time';
import makeDiscussionSidebarSticky from './features/make-discussion-sidebar-sticky';
import shortenLinks from './features/shorten-links';
import waitForBuild from './features/wait-for-build';
import addDownloadFolderButton from './features/add-download-folder-button';
import hideUselessNewsfeedEvents from './features/hide-useless-newsfeed-events';
import closeOutOfViewModals from './features/close-out-of-view-modals';
import addScopedSearchOnUserProfile from './features/add-scoped-search-on-user-profile';
import monospaceTextareas from './features/monospace-textareas';
import improveShortcutHelp from './features/improve-shortcut-help';

import * as pageDetect from './libs/page-detect';
import {safeElementReady, enableFeature} from './libs/utils';
import observeEl from './libs/simplified-element-observer';
// Add globals for easier debugging
window.select = select;

async function init() {
	await safeElementReady('body');

	if (pageDetect.is404() || pageDetect.is500()) {
		return;
	}

	if (document.body.classList.contains('logged-out')) {
		console.warn('%cRefined GitHub%c only works when you’re logged in to GitHub.', 'font-weight: bold', '');
		return;
	}

	if (select.exists('html.refined-github')) {
		console.warn('Refined GitHub has been loaded twice. If you didn’t install the developer version, this may be a bug. Please report it to: https://github.com/sindresorhus/refined-github/issues/565');
		return;
	}

	document.documentElement.classList.add('refined-github');

	if (!pageDetect.isGist()) {
		enableFeature(addTrendingMenuItem);
	}

	if (pageDetect.isDashboard()) {
		enableFeature(moveAccountSwitcherToSidebar);
		enableFeature(hideUselessNewsfeedEvents);
	}

	if (pageDetect.isRepo()) {
		onAjaxedPages(async () => {
			// Wait for the tab bar to be loaded
			await safeElementReady('.pagehead + *');
			enableFeature(addMoreDropdown);
			enableFeature(addReleasesTab);
			enableFeature(removeProjectsTab);
		});
	}

	if (pageDetect.isUserProfile()) {
		enableFeature(addScopedSearchOnUserProfile);
	}

	enableFeature(focusConfirmationButtons);
	enableFeature(addKeyboardShortcutsToCommentFields);
	enableFeature(addConfirmationToCommentCancellation);
	enableFeature(monospaceTextareas);

	// TODO: Enable this when we've improved how copying Markdown works
	// See #522
	// delegate('.markdown-body', 'copy', copyMarkdown);

	await domLoaded;
	onDomReady();
}

function onDomReady() {
	enableFeature(markUnread);
	enableFeature(addOpenAllNotificationsButton);
	enableFeature(enableCopyOnY);
	enableFeature(addProfileHotkey);
	enableFeature(makeDiscussionSidebarSticky);
	enableFeature(closeOutOfViewModals);
	enableFeature(improveShortcutHelp);

	if (!pageDetect.isGist()) {
		enableFeature(moveMarketplaceLinkToProfileDropdown);
		enableFeature(addYourRepoLinkToProfileDropdown);
	}

	if (pageDetect.isGist()) {
		enableFeature(addFileCopyButton);
	}

	if (pageDetect.isDashboard()) {
		enableFeature(hideOwnStars);
		enableFeature(autoLoadMoreNews);
	}

	onAjaxedPages(ajaxedPagesHandler);
}

// eslint-disable-next-line complexity
function ajaxedPagesHandler() {
	enableFeature(hideEmptyMeta);
	enableFeature(removeUploadFilesButton);
	enableFeature(addTitleToEmojis);
	enableFeature(shortenLinks);
	enableFeature(linkifyCode);
	enableFeature(addDownloadFolderButton);
	enableFeature(linkifyBranchRefs);

	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
		enableFeature(addYoursMenuItem);
		enableFeature(addCommentedMenuItem);
	}

	enableFeature(sortIssuesByUpdateTime); // Must be after addYoursMenuItem + addCommentedMenuItem

	if (pageDetect.isMilestone()) {
		enableFeature(addMilestoneNavigation); // Needs to be before sortMilestonesByClosestDueDate
	}

	if (pageDetect.isRepo()) {
		enableFeature(addReadmeButtons);
		enableFeature(addBranchButtons);
		enableFeature(addDiffViewWithoutWhitespaceOption);
		enableFeature(removeDiffSigns);
		enableFeature(addCILink);
		enableFeature(sortMilestonesByClosestDueDate); // Needs to be after addMilestoneNavigation
	}

	if (pageDetect.isRepoRoot()) {
		enableFeature(addToggleFilesButton);
	}

	if (pageDetect.isPR()) {
		enableFeature(scrollToTopOnCollapse);
		enableFeature(addDeleteForkLink);
		enableFeature(fixSquashAndMergeTitle);
		enableFeature(openCIDetailsInNewTab);
		enableFeature(waitForBuild);
		enableFeature(toggleAllThingsWithAlt);
	}

	if (pageDetect.isPR() || pageDetect.isIssue()) {
		enableFeature(linkifyIssuesInTitles);
		enableFeature(addUploadBtn);
		enableFeature(embedGistInline);
		enableFeature(extendIssueStatusLabel);
		enableFeature(highlightClosingPrsInOpenIssues);

		observeEl('.new-discussion-timeline', () => {
			enableFeature(addOPLabels);
			enableFeature(addTimeMachineLinksToComments);
		});
	}

	if (pageDetect.isNewIssue()) {
		enableFeature(addUploadBtn);
	}

	if (pageDetect.isIssue() || pageDetect.isPRConversation()) {
		enableFeature(addJumpToBottomLink);
	}

	if (pageDetect.isPRList() || pageDetect.isIssueList()) {
		enableFeature(addFilterCommentsByYou);
	}

	if (pageDetect.isPRList() || pageDetect.isIssueList() || pageDetect.isPR() || pageDetect.isIssue()) {
		enableFeature(showRecentlyPushedBranches);
	}

	if (pageDetect.isCommit()) {
		enableFeature(addPatchDiffLinks);
		enableFeature(toggleAllThingsWithAlt);
	}

	if (pageDetect.isCompare()) {
		enableFeature(toggleAllThingsWithAlt);
	}

	if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit() || pageDetect.isDiscussion()) {
		enableFeature(addReactionParticipants);
		enableFeature(showRealNames);
	}

	if (pageDetect.isCommitList()) {
		enableFeature(markMergeCommitsInList);
	}

	if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
		enableFeature(addCopyFilePathToPRs);
		enableFeature(preserveWhitespaceOptionInNav);
	}

	if (pageDetect.isPRFiles()) {
		enableFeature(addQuickReviewButtons);
		enableFeature(extendDiffExpander);
	}

	if (pageDetect.isSingleFile()) {
		enableFeature(addFileCopyButton);
	}

	if (pageDetect.isUserProfile()) {
		enableFeature(addGistsLink);
		enableFeature(autoLoadContributionActivities);
	}
}

init();
