import 'webext-dynamic-content-scripts';
import {h} from 'dom-chef';
import select from 'select-dom';
import domLoaded from 'dom-loaded';

import markUnread from './features/mark-unread';
import addOpenAllNotificationsButton from './features/open-all-notifications';
import batchOpenIssues from './features/batch-open-issues';
import addUploadBtn from './features/upload-button';
import enableCopyOnY from './features/copy-on-y';
import addReactionParticipants from './features/reactions-avatars';
import showRealNames from './features/show-names';
import addPrevNextButtonsToPRs from './features/prev-next-commit-buttons';
import addFileCopyButton from './features/copy-file';
import linkifyCode from './features/linkify-urls-in-code';
import infiniteScroll from './features/infinite-scroll';
import addOPLabels from './features/op-labels';
import addMoreDropdown from './features/more-dropdown';
import addReleasesTab from './features/add-releases-tab';
import addGistsLink from './features/add-gists-link-to-profile';
import addTimeMachineLinksToComments from './features/add-time-machine-links-to-comments';
import removeUploadFilesButton from './features/remove-upload-files-button';
import scrollToTopOnCollapse from './features/scroll-to-top-on-collapse';
import linkifyBranchRefs from './features/linkify-branch-refs';
import hideEmptyMeta from './features/hide-empty-meta';
import hideInactiveDeployments from './features/hide-inactive-deployments';
import hideOwnStars from './features/hide-own-stars';
import moveMarketplaceLinkToProfileDropdown from './features/move-marketplace-link-to-profile-dropdown';
import addTrendingMenuItem from './features/add-trending-menu-item';
import addProfileHotkey from './features/add-profile-hotkey';
import addYoursMenuItem from './features/add-yours-menu-item';
import addCommentedMenuItem from './features/add-commented-menu-item';
import addToggleFilesButton from './features/add-toggle-files-button';
import hideReadmeHeader from './features/hide-readme-header';
import addBranchButtons from './features/add-branch-buttons';
import addDeleteForkLink from './features/add-delete-fork-link';
import linkifyIssuesInTitles from './features/linkify-issues-in-titles';
import addPatchDiffLinks from './features/add-patch-diff-links';
import markMergeCommitsInList from './features/mark-merge-commits-in-list';
import showRecentlyPushedBranchesOnMorePages from './features/show-recently-pushed-branches-on-more-pages';
import addDiffViewWithoutWhitespaceOption from './features/add-diff-view-without-whitespace-option';
import preserveWhitespaceOptionInNav from './features/preserve-whitespace-option-in-nav';
import addMilestoneNavigation from './features/add-milestone-navigation';
import addFilterCommentsByYou from './features/add-filter-comments-by-you';
import excludeFilterShortcut from './features/exclude-filter-shortcut';
import removeProjectsTab from './features/remove-projects-tab';
import hideUselessComments from './features/hide-useless-comments';
import fixSquashAndMergeTitle from './features/fix-squash-and-merge-title';
import fixSquashAndMergeMessage from './features/fix-squash-and-merge-message';
import addTitleToEmojis from './features/add-title-to-emojis';
import sortMilestonesByClosestDueDate from './features/sort-milestones-by-closest-due-date';
import openCIDetailsInNewTab from './features/open-ci-details-in-new-tab';
import focusConfirmationButtons from './features/focus-confirmation-buttons';
import addKeyboardShortcutsToCommentFields from './features/add-keyboard-shortcuts-to-comment-fields';
import addCreateReleaseShortcut from './features/add-create-release-shortcut';
import addCILink from './features/add-ci-link';
import embedGistInline from './features/embed-gist-inline';
import extendStatusLabels from './features/extend-status-labels';
import highlightClosingPrsInOpenIssues from './features/highlight-closing-prs-in-open-issues';
import addJumpToBottomLink from './features/add-jump-to-bottom-link';
import addQuickReviewButtons from './features/add-quick-review-buttons';
import extendDiffExpander from './features/extend-diff-expander';
import sortIssuesByUpdateTime from './features/sort-issues-by-update-time';
import makeDiscussionSidebarSticky from './features/make-discussion-sidebar-sticky';
import makeHeadersSticky from './features/make-headers-sticky';
import shortenLinks from './features/shorten-links';
import waitForBuild from './features/wait-for-build';
import addDownloadFolderButton from './features/add-download-folder-button';
import hideUselessNewsfeedEvents from './features/hide-useless-newsfeed-events';
import closeOutOfViewModals from './features/close-out-of-view-modals';
import monospaceTextareas from './features/monospace-textareas';
import improveShortcutHelp from './features/improve-shortcut-help';
import hideNavigationHoverHighlight from './features/hide-navigation-hover-highlight';
import addPullRequestHotkey from './features/add-pull-request-hotkey';
import openSelectionInNewTab from './features/add-selection-in-new-tab';
import addSwapBranchesOnCompare from './features/add-swap-branches-on-compare';
import showFollowersYouKnow from './features/show-followers-you-know';
import hideCommentsFaster from './features/hide-comments-faster';
import linkifyCommitSha from './features/linkify-commit-sha';
import hideIssueListAutocomplete from './features/hide-issue-list-autocomplete';
import showUserTopRepositories from './features/show-user-top-repositories';
import userProfileFollowerBadge from './features/user-profile-follower-badge';
import usefulNotFoundPage from './features/useful-not-found-page';
import setDefaultRepositoriesTypeToSources from './features/set-default-repositories-type-to-sources';
import markPrivateOrgs from './features/mark-private-orgs';
import navigatePagesWithArrowKeys from './features/navigate-pages-with-arrow-keys';
import addStarRepoHotkey from './features/add-star-repo-hotkey';
import bypassChecksTravis from './features/bypass-checks-travis';

import * as pageDetect from './libs/page-detect';
import {safeElementReady, enableFeature, safeOnAjaxedPages, injectCustomCSS} from './libs/utils';

// Add globals for easier debugging
window.select = select;

async function init() {
	await safeElementReady('body');

	if (pageDetect.is500()) {
		return;
	}

	if (pageDetect.is404()) {
		enableFeature(usefulNotFoundPage);
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

	injectCustomCSS();

	if (!pageDetect.isGist()) {
		enableFeature(addTrendingMenuItem);
	}

	if (pageDetect.isDashboard() && !pageDetect.isGist()) {
		enableFeature(hideUselessNewsfeedEvents);
	}

	if (pageDetect.isRepo()) {
		safeOnAjaxedPages(async () => {
			// Wait for the tab bar to be loaded
			await safeElementReady('.pagehead + *');
			enableFeature(addMoreDropdown);
			enableFeature(addReleasesTab);
			enableFeature(removeProjectsTab);
		});
	}

	enableFeature(focusConfirmationButtons);
	enableFeature(addKeyboardShortcutsToCommentFields);
	enableFeature(hideNavigationHoverHighlight);
	enableFeature(monospaceTextareas);
	enableFeature(openSelectionInNewTab);
	enableFeature(hideCommentsFaster);
	enableFeature(markUnread);

	await domLoaded;
	onDomReady();
}

async function onDomReady() {
	enableFeature(addOpenAllNotificationsButton);
	enableFeature(enableCopyOnY);
	enableFeature(addProfileHotkey);
	enableFeature(makeDiscussionSidebarSticky);
	enableFeature(closeOutOfViewModals);
	enableFeature(improveShortcutHelp);
	enableFeature(addUploadBtn);

	if (!pageDetect.isGist()) {
		enableFeature(moveMarketplaceLinkToProfileDropdown);
	}

	if (pageDetect.isGist()) {
		enableFeature(addFileCopyButton);
	}

	if (pageDetect.isDashboard()) {
		enableFeature(hideOwnStars);
		enableFeature(infiniteScroll);
	}

	// Push safeOnAjaxedPages on the next tick so it happens in the correct order
	// (specifically for addOpenAllNotificationsButton)
	await Promise.resolve();

	safeOnAjaxedPages(() => {
		ajaxedPagesHandler();

		// Mark current page as "done"
		// so history.back() won't reapply the same changes
		const ajaxContainer = select('#js-repo-pjax-container,#js-pjax-container');
		if (ajaxContainer) {
			ajaxContainer.append(<has-rgh/>);
		}
	});
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
	enableFeature(batchOpenIssues);
	enableFeature(hideUselessComments);
	enableFeature(navigatePagesWithArrowKeys);
	enableFeature(makeHeadersSticky);

	if (pageDetect.isGlobalIssueSearch() || pageDetect.isGlobalPRSearch()) {
		enableFeature(addYoursMenuItem);
		enableFeature(addCommentedMenuItem);
	}

	enableFeature(sortIssuesByUpdateTime); // Must be after addYoursMenuItem + addCommentedMenuItem

	if (pageDetect.isMilestone()) {
		enableFeature(addMilestoneNavigation); // Needs to be before sortMilestonesByClosestDueDate
	}

	if (pageDetect.isRepo()) {
		enableFeature(hideReadmeHeader);
		enableFeature(addBranchButtons);
		enableFeature(addDiffViewWithoutWhitespaceOption);
		enableFeature(addCILink);
		enableFeature(sortMilestonesByClosestDueDate); // Needs to be after addMilestoneNavigation
		enableFeature(addStarRepoHotkey);
	}

	if (pageDetect.isRepoRoot()) {
		enableFeature(addToggleFilesButton);
	}

	if (pageDetect.isPR()) {
		enableFeature(scrollToTopOnCollapse);
		enableFeature(addDeleteForkLink);
		enableFeature(fixSquashAndMergeTitle);
		enableFeature(fixSquashAndMergeMessage);
		enableFeature(openCIDetailsInNewTab);
		enableFeature(waitForBuild);
		enableFeature(hideInactiveDeployments);
		enableFeature(addPullRequestHotkey);
		enableFeature(addQuickReviewButtons);
	}

	if (pageDetect.isPR() || pageDetect.isIssue()) {
		enableFeature(linkifyIssuesInTitles);
		enableFeature(embedGistInline);
		enableFeature(extendStatusLabels);
		enableFeature(highlightClosingPrsInOpenIssues);
		enableFeature(addOPLabels);
		enableFeature(addTimeMachineLinksToComments);
	}

	if (pageDetect.isIssue() || pageDetect.isPRConversation()) {
		enableFeature(addJumpToBottomLink);
	}

	if (pageDetect.isIssueList()) {
		enableFeature(addFilterCommentsByYou);
		enableFeature(hideIssueListAutocomplete);
		enableFeature(excludeFilterShortcut);
	}

	if (pageDetect.isIssueList() || pageDetect.isPR() || pageDetect.isIssue()) {
		enableFeature(showRecentlyPushedBranchesOnMorePages);
	}

	if (pageDetect.isReleasesOrTags()) {
		enableFeature(addCreateReleaseShortcut);
	}

	if (pageDetect.isCommit()) {
		enableFeature(addPatchDiffLinks);
	}

	if (pageDetect.isCompare()) {
		enableFeature(addSwapBranchesOnCompare);
	}

	if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit() || pageDetect.isDiscussion()) {
		enableFeature(addReactionParticipants);
		enableFeature(showRealNames);
	}

	if (pageDetect.isCommitList()) {
		enableFeature(markMergeCommitsInList);
	}

	if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
		enableFeature(addPrevNextButtonsToPRs);
		enableFeature(preserveWhitespaceOptionInNav);
	}

	if (pageDetect.isPRFiles()) {
		enableFeature(extendDiffExpander);
	}

	if (pageDetect.isSingleFile()) {
		enableFeature(addFileCopyButton);
	}

	if (pageDetect.isUserProfile()) {
		enableFeature(addGistsLink);
		enableFeature(showFollowersYouKnow);
		enableFeature(showUserTopRepositories);
		enableFeature(setDefaultRepositoriesTypeToSources);
		enableFeature(userProfileFollowerBadge);
	}

	if (pageDetect.isOwnUserProfile()) {
		enableFeature(markPrivateOrgs);
	}

	if (pageDetect.isPRCommit()) {
		enableFeature(linkifyCommitSha);
	}

	if (pageDetect.isPRConversation()) {
		enableFeature(bypassChecksTravis);
	}
}

init();
