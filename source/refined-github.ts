import select from 'select-dom';

import './refined-github.css';
import './features/github-bugs.css';
import './features/scrollable-code-and-blockquote.css';
import './features/center-reactions-popup.css';
import './features/clean-dashboard.css';
import './features/safer-destructive-actions.css';
import './features/clean-mergeability-box.css';
import './features/clean-footer.css';
import './features/pr-approvals-count.css';
import './features/hide-tips.css';
import './features/hide-readme-header.css';
import './features/hide-obvious-tooltips.css';
import './features/clean-conversations.css';
import './features/sticky-conversation-list-toolbar.css';
import './features/always-show-branch-delete-buttons.css';
import './features/easier-pr-sha-copy.css';
import './features/repo-stats-spacing.css';
import './features/emphasize-draft-pr-label.css';
import './features/clean-notifications.css';
import './features/clean-pinned-issues.css';
import './features/fix-first-tab-length.css';
import './features/align-repository-header.css';

// DO NOT add CSS files here if they are part of a JavaScript feature.
// Import the `.css` file from the `.tsx` instead.
import './features/cross-deleted-pr-branches';
import './features/repo-wide-file-finder';
import './features/preserve-file-finder-term';
import './features/file-finder-buffer';
import './features/pr-commit-lines-changed';
import './features/show-open-prs-of-forks';
import './features/clone-branch';
import './features/deep-reblame';
import './features/clear-pr-merge-commit-message';
import './features/go-to-action-from-file';
import './features/action-used-by-link';
import './features/batch-mark-files-as-viewed';
import './features/unwrap-useless-dropdowns';
import './features/linkify-notification-repository-header';
import './features/stop-redirecting-in-notification-bar';
import './features/prevent-pr-commit-link-loss';
import './features/first-published-tag-for-merged-pr';
import './features/show-associated-branch-prs-on-fork';
import './features/faster-reviews';
import './features/fork-source-link-same-view';
import './features/pr-jump-to-first-non-viewed-file';
import './features/keyboard-navigation';
import './features/vertical-front-matter';
import './features/use-first-commit-message-for-new-prs';
import './features/linkify-user-edit-history-popup';
import './features/cleanup-repo-filelist-actions';
import './features/prevent-duplicate-pr-submission';
import './features/remove-label-faster';
import './features/clean-conversation-headers';
import './features/stop-pjax-loading-with-esc';
import './features/highlight-deleted-and-added-files-in-diffs';
import './features/convert-release-to-draft';
import './features/linkify-full-profile-readme-title';
import './features/same-page-definition-jump';
import './features/new-repo-disable-projects-and-wikis';
import './features/table-input';
import './features/link-to-gihub-io';
import './features/next-scheduled-github-action';

// Add global for easier debugging
(window as any).select = select;
