import {h} from 'dom-chef';
import select from 'select-dom';
import 'webext-dynamic-content-scripts';
import features from './libs/features';

import './features/useful-not-found-page';
import './features/add-trending-menu-item';
import './features/hide-useless-newsfeed-events';
import './features/more-dropdown';
import './features/add-releases-tab';
import './features/remove-projects-tab';
import './features/focus-confirmation-buttons';
import './features/add-keyboard-shortcuts-to-comment-fields';
import './features/hide-navigation-hover-highlight';
import './features/monospace-textareas';
import './features/add-selection-in-new-tab';
import './features/hide-comments-faster';
import './features/mark-unread';
import './features/open-all-notifications';
import './features/copy-on-y';
import './features/add-profile-hotkey';
import './features/make-discussion-sidebar-sticky';
import './features/close-out-of-view-modals';
import './features/improve-shortcut-help';
import './features/upload-button';
import './features/move-marketplace-link-to-profile-dropdown';
import './features/copy-file';
import './features/hide-own-stars';
import './features/infinite-scroll';
import './features/hide-empty-meta';
import './features/remove-upload-files-button';
import './features/add-title-to-emojis';
import './features/shorten-links';
import './features/linkify-urls-in-code';
import './features/add-download-folder-button';
import './features/linkify-branch-refs';
import './features/batch-open-issues';
import './features/hide-useless-comments';
import './features/navigate-pages-with-arrow-keys';
import './features/make-headers-sticky';
import './features/add-yours-menu-item';
import './features/add-commented-menu-item';
import './features/sort-issues-by-update-time'; // Must be after add-yours-menu-item + add-commented-menu-item
import './features/hide-readme-header';
import './features/add-branch-buttons';
import './features/add-diff-view-without-whitespace-option';
import './features/add-ci-link';
import './features/add-milestone-navigation';
import './features/sort-milestones-by-closest-due-date'; // Needs to be after add-milestone-navigation
import './features/add-star-repo-hotkey';
import './features/add-toggle-files-button';
import './features/scroll-to-top-on-collapse';
import './features/add-delete-fork-link';
import './features/fix-squash-and-merge-title';
import './features/fix-squash-and-merge-message';
import './features/open-ci-details-in-new-tab';
import './features/wait-for-build';
import './features/hide-inactive-deployments';
import './features/add-pull-request-hotkey';
import './features/add-quick-review-buttons';
import './features/linkify-issues-in-titles';
import './features/embed-gist-inline';
import './features/extend-status-labels';
import './features/highlight-closing-prs-in-open-issues';
import './features/op-labels';
import './features/add-time-machine-links-to-comments';
import './features/add-jump-to-bottom-link';
import './features/add-filter-comments-by-you';
import './features/hide-issue-list-autocomplete';
import './features/exclude-filter-shortcut';
import './features/show-recently-pushed-branches-on-more-pages';
import './features/add-create-release-shortcut';
import './features/add-patch-diff-links';
import './features/add-swap-branches-on-compare';
import './features/reactions-avatars';
import './features/show-names';
import './features/mark-merge-commits-in-list';
import './features/prev-next-commit-buttons';
import './features/preserve-whitespace-option-in-nav';
import './features/extend-diff-expander';
import './features/add-gists-link-to-profile';
import './features/show-followers-you-know';
import './features/show-user-top-repositories';
import './features/set-default-repositories-type-to-sources';
import './features/user-profile-follower-badge';
import './features/mark-private-orgs';
import './features/linkify-commit-sha';
import './features/bypass-checks-travis';

// Add global for easier debugging
window.select = select;

// Must be called after all the features were added to onAjaxedPages
// to mark the current load as "done", so history.back() won't reapply the same DOM changes
features.safeOnAjaxedPages(() => {
	const ajaxContainer = select('#js-repo-pjax-container,#js-pjax-container');
	if (ajaxContainer) {
		ajaxContainer.append(<has-rgh/>);
	}
});
