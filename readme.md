# <img src="source/icon.png" width="45" align="left"> Refined GitHub

[link-cws]: https://chrome.google.com/webstore/detail/refined-github/hlepfoohegkhhmjieoechaddaejaokhf "Version published on Chrome Web Store"
[link-amo]: https://addons.mozilla.org/en-US/firefox/addon/refined-github-/ "Version published on Mozilla Add-ons"

> Browser extension that simplifies the GitHub interface and adds useful features

We use GitHub a lot and notice many annoyances we'd like to fix. So here be dragons.

Our hope is that GitHub will notice and implement some of these much needed improvements. So if you like any of these improvements, please email [GitHub support](mailto:support@github.com) about doing it.

GitHub Enterprise is also supported. More info in the options.

---

<a href="https://entwicklerstube.com">
	<img src="https://sindresorhus.com/assets/thanks/entwicklerstube-refined-github.svg" align="right">
</a>

- [Latest changes](https://github.com/sindresorhus/refined-github/issues/1137) *(Updated regularly. Subscribe!)*
- [Product Hunt submission](https://www.producthunt.com/posts/refined-github) *(2017-07-08)*
- [What's new lately](https://blog.sindresorhus.com/whats-new-in-refined-github-836d05582df7) *(2017-06-23)*
- [Original announcement](https://blog.sindresorhus.com/refined-github-21185789685d) *(2016-03-31)*


## Install

- [**Chrome** extension][link-cws] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/hlepfoohegkhhmjieoechaddaejaokhf.svg?label=%20">][link-cws]
- [**Firefox** add-on][link-amo] [<img valign="middle" src="https://img.shields.io/amo/v/refined-github-.svg?label=%20">][link-amo]
- **Opera** extension: Use [this Opera extension](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/) to install the Chrome version.


## Highlights 🔥

<table>
	<tr>
		<th width="50%">
			Adds button to mark issues and PRs as unread<br>
			<em>(They will reappear in Notifications)</em>
		</th>
		<th width="50%">
			Adds one-click merge conflict fixers
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img width="245" src="https://user-images.githubusercontent.com/1402241/27847663-963b7d7c-6171-11e7-9470-6e86d8463771.png">
		</td>
		<td>
			<img width="618" src="https://user-images.githubusercontent.com/1402241/54978791-45906080-4fdc-11e9-8fe1-45374f8ff636.png">
		</td>
	</tr>
</table>

<table>
	<tr>
		<th width="50%">
			Adds reaction avatars showing <i>who</i> reacted to a comment
		</th>
		<th width="50%">
			Adds the option to wait for checks when merging a PR
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img src="https://user-images.githubusercontent.com/1402241/34438653-f66535a4-ecda-11e7-9406-2e1258050cfa.png">
		</td>
		<td>
			<img src="https://user-images.githubusercontent.com/1402241/35192861-3f4a1bf6-fecc-11e7-8b9f-35ee019c6cdf.gif">
		</td>
	</tr>
</table>

<table>
	<tr>
		<th width="50%">
			Linkifies issue/PR references and URLs in code
		</th>
		<th width="50%">
			Adds link to an issue’s closing commit or pull request
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img src="https://cloud.githubusercontent.com/assets/170270/25370217/61718820-29b3-11e7-89c5-2959eaf8cac8.png">
		</td>
		<td>
			<img src="https://user-images.githubusercontent.com/1402241/35973522-5c00acb6-0d08-11e8-89ca-03071de15c6f.png">
			<img src="https://user-images.githubusercontent.com/1402241/37037746-8b8eac8a-2185-11e8-94f6-4d50a9c8a152.png">
		</td>
	</tr>
</table>

<!--

############################
  Descriptions style guide
############################

- Starts with: "(Refined GitHub) <verb in third person> ..."
- Ends with period (inside link or parens, if present, like this.)
- Keyboard shortcuts must follow:
	- "Adds a keyboard shortcut to ...: <kbd>key1</kbd> <kbd>key2</kbd>"
	- "Adds keyboard shortcuts to ...: <kbd>a</kbd> and <kbd>alt</kbd> <kbd>a</kbd>"
- You should try to use the same description and screenshot in the feature’s file (inside `features.add`)
- Use smart apostrophes: ’ instead of '
- Keep it concise.

Thanks for contributing! 🦋🙌

-->

### Repositories

- [](# "ci-link") 🔥 [Adds a build/CI status icon next to the repo’s name.](https://user-images.githubusercontent.com/1402241/32562120-d65166e4-c4e8-11e7-90fb-cbaf36e2709f.png)
- [](# "release-download-count") [Adds a download count next to release assets.](https://user-images.githubusercontent.com/14323370/58944460-e1aeb480-874f-11e9-8052-2d4dc794ecab.png)
- [](# "hide-navigation-hover-highlight") Removes the file hover effect in the repo file browser.
- [](# "hide-empty-meta") Hides the placeholder text in repos without a description.
- [](# "remove-projects-tab") Hides the `Projects` tab from repositories and profiles when it’s empty.
    * New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
- [](# "hide-watch-and-fork-count") [Hides forks and watchers counters.](https://user-images.githubusercontent.com/1402241/53681077-f3328b80-3d1e-11e9-9e29-2cb017141769.png)
- [](# "sort-milestones-by-closest-due-date") Changes the default sort order of milestones `Closest due date`.
- [](# "releases-tab") [Adds a `Releases` tab and a keyboard shortcut: <kbd>g</kbd> <kbd>r</kbd>.](https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png)
- [](# "create-release-shortcut") Adds a keyboard shortcut to create a new release while on the Releases page: <kbd>c</kbd>.
- [](# "more-dropdown") [Adds links to `Commits`, `Branches`, `Dependencies`, and `Compare` in a new `More` dropdown.](https://user-images.githubusercontent.com/1402241/55089736-d94f5300-50e8-11e9-9095-329ac74c1e9f.png)
- [](# "star-repo-hotkey") Adds a keyboard shortcut to star/unstar the current repo: <kbd>g</kbd> <kbd>s</kbd>.
- [](# "tags-dropdown") [Adds a tags dropdown/search on tag/release pages.](https://user-images.githubusercontent.com/22439276/56373231-27ee9980-621e-11e9-9b21-601919d3dddf.png)
- [](# "tag-changelog-link") 🔥 [Adds a link to an automatic changelog for each tag/release.](https://user-images.githubusercontent.com/1402241/57081611-ad4a7180-6d27-11e9-9cb6-c54ec1ac18bb.png)
- [](# "download-folder-button") [Adds a button to a download button entire folders.](https://user-images.githubusercontent.com/1402241/35044451-fd3e2326-fbc2-11e7-82e1-61ec7bee612b.png) *Uses [download-directory.github.io](https://download-directory.github.io)*
- [](# "toggle-files-button") [Adds a button to toggle the repo file list.](https://user-images.githubusercontent.com/1402241/35480123-68b9af1a-043a-11e8-8934-3ead3cff8328.gif)
- [](# "edit-files-faster") [Adds a button to edit files from the repo file list.](https://user-images.githubusercontent.com/1402241/56370462-d51cde00-622d-11e9-8cd3-8a173bd3dc08.png)
- [](# "edit-readme") [Adds an Edit button on previewed Readmes in folders, even if you have to make a fork.](https://user-images.githubusercontent.com/1402241/62073307-a8378880-b26a-11e9-9e31-be6525d989d2.png)
- [](# "branch-buttons") 🔥 [Adds links to the default branch and to the latest version tag.](https://user-images.githubusercontent.com/1402241/38107328-ccb3fb46-33bb-11e8-9654-23a6410943cc.png)
- [](# "swap-branches-on-compare") [Adds link to swap branches in the branch compare view.](https://user-images.githubusercontent.com/857700/42854438-821096f2-8a01-11e8-8752-76f7563b5e18.png)
- [](# "linkify-branch-refs") [Linkifies branch references in "Quick PR" pages.](https://user-images.githubusercontent.com/1402241/30208043-fa1ceaec-94bb-11e7-9c32-feabcf7db296.png)
- [](# "hide-zero-packages") [Hides the `Packages` tab in repositories if it’s empty.](https://user-images.githubusercontent.com/35382021/62426530-688ef780-b6d5-11e9-93f2-515110aed1eb.jpg)
- [](# "reload-failed-proxied-images") [Retries downloading images that failed downloading due to GitHub limited proxying.](https://user-images.githubusercontent.com/14858959/64068746-21991100-cc45-11e9-844e-827f5ac9b51e.png)
- [](# "forked-to") [Adds a shortcut to your forks next to the `Fork` button on the current repo.](https://user-images.githubusercontent.com/55841/64077281-17bbf000-cccf-11e9-9123-092063f65357.png)

<!-- Refer to style guide above. Keep this message between sections. -->

### Code

- [](# "copy-on-y") Enhances [the <kbd>y</kbd> hotkey](https://help.github.com/articles/getting-permanent-links-to-files/) to also copy the permalink.
- [](# "view-markdown-source") [Adds a button to view the source of Markdown files.](https://user-images.githubusercontent.com/1402241/54814836-7bc39c80-4ccb-11e9-8996-9ecf4f6036cb.png)
- [](# "copy-file") [Adds a button to copy a file’s content.](https://cloud.githubusercontent.com/assets/170270/14453865/8abeaefe-00c1-11e6-8718-9406cee1dc0d.png)
- [](# "linkify-symbolic-links") [Linkifies symbolic links files.](https://user-images.githubusercontent.com/1402241/62036664-6d0e6880-b21c-11e9-9270-4ae30cc10de2.png)
- [](# "list-prs-for-file") [Shows PRs that touch the current file.](https://user-images.githubusercontent.com/55841/60622834-879e1f00-9de1-11e9-9a9e-bae5ec0b3728.png)
- [](# "show-whitespace") 🔥 [Shows whitespace characters.](https://user-images.githubusercontent.com/1402241/61187598-f9118380-a6a5-11e9-985a-990a7f798805.png)
- [](# "content") [Reduces tabs’ size to 4 spaces instead of 8.](https://cloud.githubusercontent.com/assets/170270/14170088/d3be931e-f755-11e5-8edf-c5f864336382.png)
- [](# "esc-to-deselect-line") [Adds a keyboard shortcut to deselect the current line: <kbd>esc</kbd>.](https://github.com/sindresorhus/refined-github/issues/1590)

<!-- Refer to style guide above. Keep this message between sections. -->

### Writing comments

- [](# "tab-to-indent") 🔥 [Enables the <kbd>tab</kbd> key for indentation in comment fields.](https://user-images.githubusercontent.com/1402241/33802977-beb8497c-ddbf-11e7-899c-698d89298de4.gif)
- [](# "submit-review-as-single-comment") [Adds a button to submit a single PR comment if you mistakenly started a new review.](https://user-images.githubusercontent.com/1402241/60331761-f6394200-99c7-11e9-81c2-c671cba9602a.gif)
- [](# "collapsible-content-button") [Adds a button to insert collapsible content (via `<details>`).](https://user-images.githubusercontent.com/1402241/53678019-0c721280-3cf4-11e9-9c24-4d11a697f67c.png)
- [](# "fit-textareas") 🔥 [Auto-resizes comment fields to fit their content and no longer show scroll bars.](https://user-images.githubusercontent.com/1402241/54336211-66fd5e00-4666-11e9-9c5e-111fccab004d.gif)
- [](# "edit-comments-faster") [Moves the `Edit comment` button out of the `...` dropdown.](https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png)
- [](# "comment-fields-keyboard-shortcuts") [Adds a shortcut to edit your last comment: <kbd>↑</kbd>.](https://github.com/sindresorhus/refined-github/pull/961) (Only works in the following comment field, if it’s empty.)
- [](# "one-key-formatting") [Wraps selected text when pressing one of Markdown symbols instead of replacing it:](https://user-images.githubusercontent.com/1402241/65020298-1f2dfb00-d957-11e9-9a2a-1c0ceab8d9e0.gif) `[` <code>\`</code> `'` `"` `*` `~` `_`
- [](# "minimize-upload-bar") [Reduces the upload bar to a small button.](https://user-images.githubusercontent.com/55841/59802383-3d994180-92e9-11e9-835d-60de67611c30.png)
- [](# "clean-rich-text-editor") [Hides unnecessary comment field tooltips and toolbar items](https://user-images.githubusercontent.com/1402241/53629083-a4fe8900-3c47-11e9-8211-bfe2d254ffcb.png) (each one has a keyboard shortcut.)
- [](# "monospace-textareas") Use a monospace font for all textareas.

<!-- Refer to style guide above. Keep this message between sections. -->

### Reading comments

- [](# "embed-gist-inline") [Embeds linked gists.](https://user-images.githubusercontent.com/6978877/33911900-c62ee968-df8b-11e7-8685-506ffafc60b4.PNG)
- [](# "comments-time-machine-links") Adds links to [browse the repository](https://user-images.githubusercontent.com/1402241/56450896-68076680-635b-11e9-8b24-ebd11cc4e655.png) and [linked files](https://user-images.githubusercontent.com/1402241/56450895-68076680-635b-11e9-86b4-b6c2f3745d51.png) at the time of each comment.
- [](# "show-names") [Adds the real name of users by their usernames.](https://user-images.githubusercontent.com/1402241/62075835-5f82ce00-b270-11e9-91eb-4680b70cb3cb.png)
- [](# "shorten-links") [Shortens URLs and repo URLs to readable references like "_user/repo/.file@`d71718d`".](https://user-images.githubusercontent.com/1402241/27252232-8fdf8ed0-538b-11e7-8f19-12d317c9cd32.png)
- [](# "preview-hidden-comments") 🔥 [Previews hidden comments inline.](https://user-images.githubusercontent.com/1402241/52545036-6e271700-2def-11e9-8c0c-b5e0fa6f37dd.png)
- [](# "highest-rated-comment") 🔥 [Highlights the most useful comment in issues.](https://user-images.githubusercontent.com/1402241/58757449-5b238880-853f-11e9-9526-e86c41a32f00.png)
- [](# "hide-useless-comments") [Hides reaction comments ("+1", "👍", …)](https://user-images.githubusercontent.com/1402241/45543717-d45f3c00-b847-11e8-84a5-8c439d0ad1a5.png) (except the maintainers’) [but they can still be shown.](https://user-images.githubusercontent.com/1402241/45543720-d628ff80-b847-11e8-9fb6-758a3102e3a9.png)
- [](# "scrollable-code-and-blockquote") [Limits the height of tall code blocks and quotes.](https://github.com/sindresorhus/refined-github/issues/1123)
- [](# "hide-comments-faster") [Simplifies the UI to hide comments.](https://user-images.githubusercontent.com/1402241/43039221-1ddc91f6-8d29-11e8-9ed4-93459191a510.gif)
- [](# "open-issue-to-latest-comment") [Links the comments icon to the latest comment.](https://user-images.githubusercontent.com/14323370/57962709-7019de00-78e8-11e9-8398-7e617ba7a96f.png)
- [](# "minimize-user-comments") [Adds ability to minimize comments of certain users.](https://user-images.githubusercontent.com/37769974/61595681-d6d4b400-ac17-11e9-98b9-03f27b004a94.gif)

<!-- Refer to style guide above. Keep this message between sections. -->

### Discussions

- [](# "batch-open-issues") 🔥 [Adds a button to open multiple discussions at once in your repos.](https://user-images.githubusercontent.com/1402241/38084752-4820b0d8-3378-11e8-868c-a1582b16f915.gif)
- [](# "split-issue-pr-search-results") [Separates issues from PRs in the global search.](https://user-images.githubusercontent.com/1402241/52181103-35a09f80-2829-11e9-9c6f-57f2e08fc5b2.png)
- [](# "sticky-discussion-sidebar") [Makes the discussion sidebar sticky.](https://user-images.githubusercontent.com/10238474/62276723-5a2eaa80-b44d-11e9-810b-ff598d1c5c6a.gif)
- [](# "sticky-discussion-list-toolbar") [Makes the discussion list’s filters toolbar sticky.](https://user-images.githubusercontent.com/380914/39878141-7632e61a-542c-11e8-9c66-74fcd3a134aa.gif)
- [](# "highlight-collaborators-and-own-discussions") [Highlights discussions opened by you or the current repo’s collaborators.](https://user-images.githubusercontent.com/1402241/65013882-03225d80-d947-11e9-8eb8-5507bc1fc14b.png)
- [](# "align-issue-labels") [Aligns labels in lists to the left.](https://user-images.githubusercontent.com/1402241/28006237-070b8214-6581-11e7-94bc-2b01a007d00b.png)
- [](# "sort-issues-by-update-time") 🔥 Changes the default sort order of discussions to `Recently updated`.
- [](# "widen-search-field") [Widens the discussion search box.](https://user-images.githubusercontent.com/1402241/55069759-bceaf080-50bf-11e9-84d0-7707de2eb9e9.png)
- [](# "filter-comments-by-you") [Adds a `Everything commented by you` filter in the search box dropdown.](https://user-images.githubusercontent.com/170270/27501170-f394a304-586b-11e7-92d8-d92d6922356b.png)
- [](# "global-discussion-list-filters") [Adds filters for discussions _in your repos_ and _commented on by you_ in the global discussion search.](https://user-images.githubusercontent.com/8295888/36827126-8bfc79c4-1d37-11e8-8754-992968b082be.png)
- [](# "clean-sidebar") 🔥 [Hides empty sections (or just their "empty" label) in the discussion sidebar.](https://user-images.githubusercontent.com/1402241/57199809-20691780-6fb6-11e9-9672-1ad3f9e1b827.png)
- [](# "clean-issue-filters") [Hides `Projects` and `Milestones` filters in discussion lists if they are empty.](https://user-images.githubusercontent.com/37769974/59083449-0ef88f80-8915-11e9-8296-68af1ddcf191.png)
- [](# "cycle-lists-with-keyboard-shortcuts") [Allows the <kbd>↑</kbd> and <kbd>↓</kbd> keys to cycle "popover lists" (labels, milestones, etc).](https://user-images.githubusercontent.com/37769974/59158786-6fd2c400-8add-11e9-9db1-db80186fa6ea.gif)
- [](# "toggle-everything-with-alt") [Adds a shortcut to toggle all similar items (minimized comments, deferred diffs, etc) at once: <kbd>alt</kbd> <kbd>click</kbd> on each button or checkbox.](https://user-images.githubusercontent.com/37769974/62208543-dcb75b80-b3b4-11e9-984f-ddb479ea149d.gif)

<!-- Refer to style guide above. Keep this message between sections. -->

### Viewing pull requests

- [](# "linkify-commit-sha") [Adds link to non-PR commit when visiting a PR commit.](https://user-images.githubusercontent.com/101152/42968387-606b23f2-8ba3-11e8-8a4b-667bddc8d33c.png)
- [](# "filter-pr-by-build-status") [Adds a `Build status` dropdown filter in PR lists.](https://user-images.githubusercontent.com/22439276/56372372-7733ca80-621c-11e9-8b60-a0b95aa4cd4f.png)
- [](# "pr-approvals-count") [Shows color-coded review counts in PR lists.](https://user-images.githubusercontent.com/1402241/33474535-a814ee78-d6ad-11e7-8f08-a8b72799e376.png)
- [](# "pr-branches") [Shows head and base branches in PR lists if they’re significant.](https://user-images.githubusercontent.com/1402241/51428391-ae9ed500-1c35-11e9-8e54-6b6a424fede4.png)
- [](# "remove-checks-tab") Hides the `Checks` tab if it’s empty, unless you’re the owner.
- [](# "hide-inactive-deployments") [Hides inactive deployments.](https://github.com/sindresorhus/refined-github/issues/1144)
- [](# "prev-next-commit-buttons") [Adds duplicate commit navigation buttons at the bottom of the `Commits` tab page.](https://user-images.githubusercontent.com/24777/41755271-741773de-75a4-11e8-9181-fcc1c73df633.png)
- [](# "preserve-whitespace-option-in-nav") Preserves the "ignore whitespace" setting when navigating with Next/Previous in PR review mode.
- [](# "bypass-checks") [Bypasses the "Checks" interstitial when clicking the "Details" links on a PR.](https://user-images.githubusercontent.com/2103975/49071220-c6596e80-f22d-11e8-8a1e-bdcd62aa6ece.png)
- [](# "open-ci-details-in-new-tab") Opens the Checks "details" link in a new tab.
- [](# "hidden-review-comments-indicator") [Adds comment indicators when comments are hidden in PR review.](https://user-images.githubusercontent.com/1402241/63112671-011d5580-bfbb-11e9-9e19-53e11641990e.gif)

<!-- Refer to style guide above. Keep this message between sections. -->

### Editing pull requests

- [](# "sync-pr-commit-title") 🔥 [Uses the PR’s title and description when merging](https://github.com/sindresorhus/refined-github/issues/276) and [updates the PR’s title to the match the commit title, if changed.](https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png)
- [](# "add-co-authored-by") [Adds `co-authored-by` to the commit when merging PRs with multiple committers.](https://user-images.githubusercontent.com/1402241/51468821-71a42100-1da2-11e9-86aa-fc2a6a29da84.png)
- [](# "update-pr-from-base-branch") [Adds button to update a PR from the base branch to ensure it builds correctly before merging the PR itself.](https://user-images.githubusercontent.com/1402241/57941992-f2170080-7902-11e9-8f8a-594aad983559.png) GitHub only adds it when the base branch is "protected".
- [](# "quick-review-buttons") [Simplifies the PR review form: Approve or reject reviews faster with one-click review-type buttons.](https://user-images.githubusercontent.com/1402241/34326942-529cb7c0-e8f3-11e7-9bee-98b667e18a90.png)
- [](# "warn-pr-from-master") [Warns you when creating a pull request from the default branch, as it’s an anti-pattern.](https://user-images.githubusercontent.com/1402241/52543516-3ca94e00-2de5-11e9-9f80-ff8f9fe8bdc4.png)
- [](# "warning-for-disallow-edits") [Warns you when unchecking `Allow edits from maintainers`, as it’s maintainer-hostile.](https://user-images.githubusercontent.com/1402241/53151888-24101380-35ef-11e9-8d30-d6315ad97325.gif)
- [](# "pull-request-hotkey") Adds keyboard shortcuts to cycle through PR tabs: <kbd>g</kbd> <kbd>←</kbd> and <kbd>g</kbd> <kbd>→</kbd>, or <kbd>g</kbd> <kbd>1</kbd>, <kbd>g</kbd> <kbd>2</kbd>, <kbd>g</kbd> <kbd>3</kbd> and <kbd>g</kbd> <kbd>4</kbd>.
- [](# "pr-branch-auto-delete") Automatically deletes the branch right after merging a PR, if possible.
- [](# "revert-file") 🔥 [Adds button to revert all the changes to a file in a PR.](https://user-images.githubusercontent.com/1402241/62826118-73b7bb00-bbe0-11e9-9449-2dd64c469bb9.gif)

<!-- Refer to style guide above. Keep this message between sections. -->

### Commits

- [](# "faster-pr-diff-options") Adds a keyboard shortcut to ignore the whitespace in diffs: <kbd>d</kbd> <kbd>w</kbd>.
- [](# "patch-diff-links") [Adds links to `.patch` and `.diff` files in commits.](https://cloud.githubusercontent.com/assets/737065/13605562/22faa79e-e516-11e5-80db-2da6aa7965ac.png)
- [](# "default-to-rich-diff") [Renders the rich diff by default in SVG files’ diffs.](https://user-images.githubusercontent.com/5243867/57125552-c08a2b00-6d81-11e9-9b84-cdb535baa98e.png)
- [](# "raw-file-link") [Adds link to view the raw version of files in PRs and commits.](https://user-images.githubusercontent.com/1402241/56484988-b99f2500-6504-11e9-9748-c944e1070cc8.png)
- [](# "faster-pr-diff-options") [Adds one-click buttons to change diff style and to ignore the whitespace.](https://user-images.githubusercontent.com/1402241/54178764-d1c96080-44d1-11e9-889c-734ffd2a602d.png)
- [](# "follow-file-renames") 🔥 [Enhances files’ commit lists navigation to follow file renames.](https://user-images.githubusercontent.com/1402241/54799957-7306a280-4c9a-11e9-86de-b9764ed93397.png)
- [](# "link-to-file-in-file-history") [Adds links to the file itself in a file’s commit list.](https://user-images.githubusercontent.com/22439276/57195061-b88ddf00-6f6b-11e9-8ad9-13225d09266d.png)
- [](# "extend-diff-expander") [Widens the `Expand diff` button to be clickable across the screen.](https://user-images.githubusercontent.com/6978877/34470024-eee4f43e-ef20-11e7-9036-65094bd58960.PNG)
- [](# "remove-diff-signs") [Hides diff signs](https://user-images.githubusercontent.com/1402241/54807718-149cec80-4cb9-11e9-869c-e265863211e3.png) (since diffs are color coded already.)
- [](# "limit-commit-title-length") [Limits the commit title fields to 72 characters.](https://user-images.githubusercontent.com/37769974/60379478-106b3280-9a51-11e9-88b9-0e3607f214cd.gif)
- [](# "expand-all-collapsed-code") [Expands the entire file when you <kbd>alt</kbd> <kbd>click</kbd> on any "Expand code" button in diffs.](https://user-images.githubusercontent.com/44227187/64923605-d0138900-d7e3-11e9-9dc2-461aba81c1cb.gif)

<!-- Refer to style guide above. Keep this message between sections. -->

### Profiles

- [](# "show-followers-you-know") [Shows the followers you have in common.](https://user-images.githubusercontent.com/2906365/42009293-b1503f62-7a57-11e8-88f5-9c2fb3651a14.png)
- [](# "user-profile-follower-badge") [Tells you whether the user follows you.](https://user-images.githubusercontent.com/3723666/45190460-03ecc380-b20c-11e8-832b-839959ee2c99.gif)
- [](# "profile-gists-link") [Adds a link to the user’s public gists.](https://user-images.githubusercontent.com/11544418/34268306-1c974fd2-e678-11e7-9e82-861dfe7add22.png)
- [](# "mark-private-orgs") [Marks private organizations on your own profile.](https://user-images.githubusercontent.com/6775216/44633467-d5dcc900-a959-11e8-9116-e6b0ffef66af.png)
- [](# "profile-hotkey") Adds a keyboard shortcut to visit your own profile: <kbd>g</kbd> <kbd>m</kbd>.
- [](# "show-user-top-repositories") [Adds a link to the user’s most starred repositories.](https://user-images.githubusercontent.com/1402241/48474026-43e3ae80-e82c-11e8-93de-159ad4c6f283.png)
- [](# "set-default-repositories-type-to-sources") [Hides forks and archived repos from profiles (but they can still be shown.)](https://user-images.githubusercontent.com/1402241/45133648-fe21be80-b1c8-11e8-9052-e38cb443efa9.png)

<!-- Refer to style guide above. Keep this message between sections. -->

### Newsfeed

- [](# "clean-dashboard") 🔥 [Condenses the events to take up less space and uncollapses "User starred X repos" groups.](https://user-images.githubusercontent.com/1402241/54401114-39192780-4701-11e9-9934-7c71f01e957f.png)
- [](# "hide-own-stars") Hides "starred" events for your own repos.
- [](# "hide-useless-newsfeed-events") Hides other inutile events (commits, forks, new followers).
- [](# "infinite-scroll") Automagically expands the newsfeed when you scroll down.

<!-- Refer to style guide above. Keep this message between sections. -->

### Global

- [](# "useful-not-found-page") 🔥 [Adds possible related pages and alternatives on 404 pages.](https://user-images.githubusercontent.com/1402241/46402857-7bdada80-c733-11e8-91a1-856573078ff5.png)
- [](# "selection-in-new-tab") [Adds a keyboard shortcut to open selection in new tab when navigating via <kbd>j</kbd> and <kbd>k</kbd>: <kbd>shift</kbd> <kbd>o</kbd>.](https://github.com/sindresorhus/refined-github/issues/1110)
- [](# "close-out-of-view-modals") [Automatically closes dropdown menus when they’re no longer visible.](https://user-images.githubusercontent.com/1402241/37022353-531c676e-2155-11e8-96cc-80d934bb22e0.gif)
- [](# "deprioritize-marketplace-link") Moves the "Marketplace" link from the black header bar to the profile dropdown.
- [](# "parse-backticks") [Renders text in <code>\`backticks\`</code> in issue titles and commit titles.](https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png)
- [](# "trending-menu-item") Adds a `Trending` link to the global navbar and a keyboard shortcut: <kbd>g</kbd> <kbd>t</kbd>.
- [](# "navigate-pages-with-arrow-keys") Adds shortcuts to navigate through pages with pagination: <kbd>←</kbd> and <kbd>→</kbd>.
- [](# "open-all-notifications") [Open all your notifications at once.](https://user-images.githubusercontent.com/1402241/31700005-1b3be428-b38c-11e7-90a6-8f572968993b.png)
- [](# "improve-shortcut-help") [Shows all of Refined GitHub’s new keyboard shortcuts in the help modal.](https://user-images.githubusercontent.com/29176678/36999174-9f07d33e-20bf-11e8-83e3-b3a9908a4b5f.png) *(<kbd>?</kbd> hotkey)*

<!-- Refer to style guide above. Keep this message between sections. -->

### Fixes for GitHub shortcomings

- [](# "indented-code-wrapping") 🔥 [Indents wrapped code correctly.](https://user-images.githubusercontent.com/37769974/60379474-0ba67e80-9a51-11e9-97f9-077d282e5bdb.png)
- [](# "focus-confirmation-buttons") [Always focuses confirm buttons in custom modal boxes, like "Mark all as read".](https://user-images.githubusercontent.com/1402241/31700158-1499bdd8-b38d-11e7-9aba-77a0a4b6bf3c.png)
- [](# "hide-disabled-milestone-sorter") [Hides the milestone sorter UI if you don’t have permission to use it.](https://user-images.githubusercontent.com/7753001/56913933-738a2880-6ae5-11e9-9d13-1973cbbf5df0.png)
- [](# "hide-issue-list-autocomplete") [Removes the autocomplete on search fields.](https://user-images.githubusercontent.com/1402241/42991841-1f057e4e-8c07-11e8-909c-b051db7a2a03.png)
- [](# "hide-obvious-tooltips") Removes tooltips from self-explanatory buttons.
- [](# "recently-pushed-branches-enhancements") 🔥 [Moves the "Recently-pushed branches" widget to the header to avoid content jumps. Also adds it to more pages in the repo.](https://user-images.githubusercontent.com/1402241/56466173-da517700-643f-11e9-8eb5-9b20017fa613.gif)
- [](# "deemphasize-unrelated-commit-references") [Makes it easier to tell apart commits added to the current PR versus plain commits that reference the PR.](https://user-images.githubusercontent.com/1402241/64478939-398b0a80-d1da-11e9-8c6a-bb98668cb78c.gif)
- [](# "embed-gist-via-iframe") [Adds a menu item to embed a gist via `<iframe>`.](https://user-images.githubusercontent.com/44045911/63633382-6a1b6200-c67a-11e9-9038-aedd62e4f6a8.png)

<!-- Refer to style guide above. Keep this message between sections. -->

### Previously part of Refined GitHub

GitHub implemented 20 features that used to be part of Refined GitHub 🎉

<details><summary>See list</summary>

- [Blog post](https://github.com/blog/2304-navigate-file-history-faster-with-improved-blame-view): [Blame parent commits in blame view.](https://github.com/sindresorhus/refined-github/issues/2#issuecomment-189141373)
- [Blog post](https://cloud.githubusercontent.com/assets/170270/25772137/6a6b678e-3296-11e7-97c7-02e31ef17743.png): [Collapse/expand files in a PR diff.](https://cloud.githubusercontent.com/assets/170270/13954167/40caa604-f072-11e5-89ba-3145217c4e28.png)
- [Blog post](https://user-images.githubusercontent.com/1402241/31265633-779ad0fe-aa35-11e7-8c42-a3b375f8f32c.png): [Preview a issue/PR reference’s title in comments.](https://user-images.githubusercontent.com/170270/30729486-2816df06-9f8a-11e7-8069-8999302e9ddd.png)
- [Blog post](https://github.com/sindresorhus/refined-github/pull/1330): The dashboard organization switcher is moved to the right column.
- [Blog post](https://blog.github.com/changelog/2018-07-24-button-to-edit-a-repositorys-readme-from-the-repository-root/): [Quickly edit a repository’s README from the repository root.](https://user-images.githubusercontent.com/170270/27501200-31a1fa20-586c-11e7-9a3f-ce270014bf0a.png)
- [Blog post](https://blog.github.com/changelog/2018-07-25-access-your-repositories-straight-from-the-profile-dropdown/): [Access `Your repositories` from the profile dropdown.](https://user-images.githubusercontent.com/4201088/34920280-479e2454-f996-11e7-8e24-ad69793b9d9b.png)
- [Blog post](https://blog.github.com/changelog/2018-07-26-highlighting-of-permalinked-comments/): [Permalinked comments are highlighted.](https://user-images.githubusercontent.com/1402241/37349492-226bd37a-2709-11e8-8087-d9686b330240.png)
- [Blog post](https://blog.github.com/changelog/2018-07-24-keyboard-shortcut-to-leave-a-single-comment-in-pull-requests-reviews/): Leave a single comment in pull request diffs instead of starting a review by pressing <kbd>shift</kbd> <kbd>enter</kbd>.
- [Blog post](https://blog.github.com/changelog/2018-07-31-removing-files-from-a-pull-request/): [Quickly delete a file from pull requests.](https://user-images.githubusercontent.com/1402241/42529637-578587e4-847f-11e8-9705-57384a1edd24.png)
- [Blog post](https://github.com/sindresorhus/refined-github/issues/1521): Pressing `Cancel` on an inline comment opens a prompt to prevent accidental cancelling.
- [Blog post](https://blog.github.com/changelog/2018-07-31-unselectable-diff-markers/): The `+` and `-` signs in diffs are made unselectable for easier copy-pasting.
- [Blog post](https://blog.github.com/changelog/2018-08-17-collapse-all-diffs-in-a-pull-request-at-once/): Toggle all [outdated PR comments](https://user-images.githubusercontent.com/25818354/33240033-3e271588-d2af-11e7-93af-13b6e325f65d.gif) or [PR/commit files](https://user-images.githubusercontent.com/1402241/35192652-6f79dc42-fec9-11e7-89ad-2b4a9c5f4f52.gif) with <kbd>alt</kbd> <kbd>click</kbd>.
- [Blog post](https://blog.github.com/changelog/2018-11-05-related-issues/): [Avoid opening duplicate issues thanks to the list of possibly-related issues.](https://user-images.githubusercontent.com/29176678/37566899-85953e6e-2abf-11e8-9f0e-52d18c87bbe3.gif)
- [Blog post](https://blog.github.com/changelog/2018-11-16-copy-file-paths-in-diffs/): [Copy the path of a PR file.](https://cloud.githubusercontent.com/assets/4201088/26023064/18c9c77c-37d2-11e7-8926-b0a05a2706ae.png)
- [Blog post](https://blog.github.com/changelog/2018-11-26-searching-by-user-from-a-profile-page/): [Search a user profile page when visiting it.](https://user-images.githubusercontent.com/1402241/35185441-24ad4b1e-fe37-11e7-9e1b-0dc09fc1ada2.png)
- [Blog post](https://user-images.githubusercontent.com/36004334/52573199-ea365480-2e19-11e9-8ebf-3ea6a7a640f8.png): [Access the `Labels` `Milestones` navigation from individual milestone pages.](https://cloud.githubusercontent.com/assets/170270/25217211/37b67aea-25d0-11e7-8482-bead2b04ee74.png)
- [Blog post](https://github.blog/changelog/2019-02-13-comment-author-label/): [The comments of who opened an issue/PR are marked with `Original Poster` label.](https://cloud.githubusercontent.com/assets/4331946/25075520/d62fbbd0-2316-11e7-921f-ab736dc3522e.png)
- [Blog post](https://github.blog/changelog/2019-02-14-prompt-to-clean-up-merged-forks): [Quickly delete a forked repo after its pull request has been merged.](https://cloud.githubusercontent.com/assets/170270/13520281/b2c9335c-e211-11e5-9e36-b0f325166356.png)
- [Blog post](https://github.blog/changelog/2019-03-05-exclude-labels-from-search/): [Exclude PR/issue filters from their list](https://user-images.githubusercontent.com/1402241/48470535-493cfb00-e824-11e8-863a-964f52b62553.png) with <kbd>alt</kbd> <kbd>click</kbd>.
- [Blog post](https://github.blog/changelog/2019-03-18-sticky-file-headers-in-pull-requests/): [File headers are always visible.](https://user-images.githubusercontent.com/81981/28682784-78bac340-72fe-11e7-9386-bdbab7703693.gif)

</details>

## Customization

Most features [can be disabled](https://github.com/sindresorhus/refined-github/pull/877) if they are JavaScript-based *(Experimental)* and you can override the CSS with your own in [the extension options.](https://github.com/sindresorhus/refined-github/pull/1193)

We're happy to receive suggestions and contributions, but be aware this is a highly opinionated project. There's a very high bar for adding options. Users will always disagree with something. That being said, we're open to discussing things. If something doesn't make the cut, you can [build your customized Refined GitHub locally](https://github.com/sindresorhus/refined-github/blob/master/contributing.md#workflow), rather than installing it from the Chrome Store.


## Contribute

See the [contribution guide](contributing.md) and join the [contributors](https://github.com/sindresorhus/refined-github/graphs/contributors)!


## Related

- [Awesome browser extensions for GitHub](https://github.com/stefanbuck/awesome-browser-extensions-for-github) - Awesome list
- [Octo Linker](https://github.com/octo-linker/chrome-extension/) - Navigate across files and packages
- [Notifier for GitHub](https://github.com/sindresorhus/notifier-for-github-chrome) - Shows your notification unread count
- [Mottie's Userscripts](https://github.com/Mottie/GitHub-userscripts) - Countless features to improve GitHub granularly
- [Contributors on GitHub](https://github.com/hzoo/contributors-on-github) - Shows stats about contributors
- [Hide Files on GitHub](https://github.com/sindresorhus/hide-files-on-github) - Hides dotfiles from the file browser
- [GitHub Issue Link Status](https://github.com/fregante/github-issue-link-status) - Colorize issue and PR links to see their status (open, closed, merged)
- [Twitter for GitHub](https://github.com/bevacqua/twitter-for-github) - Shows a user's Twitter handle on their profile page
- [OctoEdit](https://github.com/DrewML/OctoEdit) - Markdown syntax highlighting in comments
- [Notifications Preview for GitHub](https://github.com/tanmayrajani/notifications-preview-github) - See your notifications on hover on all pages
- [GitHub Custom Tab Size](https://github.com/lukechilds/github-custom-tab-size) - Set custom tab size for code views *(Refined GitHub hard-codes it to 4)*
- [Show All GitHub Issues](https://github.com/sindresorhus/show-all-github-issues) - Shows both Issues and Pull Requests in the Issues tab
- [Refined Twitter](https://github.com/sindresorhus/refined-twitter) - Improves Twitter
- [Friendly GitHub](https://github.com/Hermanya/friendly-github) - Make GitHub more social
- [Sourcegraph](https://github.com/sourcegraph/sourcegraph/tree/master/browser) - Code search and navigation tool
- [PR Monitor](https://github.com/fwouts/prmonitor) - Notifies you about incoming and outgoing PRs

Want more? Here are some ideas you could develop!

- [Format JS code blocks with Prettier](https://github.com/sindresorhus/module-requests/issues/99)
- [Customize the font of code blocks](https://github.com/sindresorhus/module-requests/issues/97)
