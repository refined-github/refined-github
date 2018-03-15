# <img src="source/icon.png" width="45" align="left"> Refined GitHub

[link-cws]: https://chrome.google.com/webstore/detail/refined-github/hlepfoohegkhhmjieoechaddaejaokhf "Version published on Chrome Web Store"
[link-amo]: https://addons.mozilla.org/en-US/firefox/addon/refined-github-/ "Version published on Mozilla Add-ons"
[link-travis]: https://travis-ci.org/sindresorhus/refined-github

> Browser extension that simplifies the GitHub interface and adds useful features

We use GitHub a lot and notice many dumb annoyances we'd like to fix. So here be dragons.

Our hope is that GitHub will notice and implement some of these much needed improvements. So if you like any of these improvements, please email [GitHub support](mailto:support@github.com) about doing it.

GitHub Enterprise is also supported. More info in the options.

---

- [Latest changes](https://github.com/sindresorhus/refined-github/issues/1137) *(Updated regularly. Subscribe!)*
- [Product Hunt submission](https://www.producthunt.com/posts/refined-github) *(2017-07-08)*
- [What's new lately](https://blog.sindresorhus.com/whats-new-in-refined-github-836d05582df7) *(2017-06-23)*
- [Original announcement](https://blog.sindresorhus.com/refined-github-21185789685d) *(2016-03-31)*


## Install

- [**Chrome** extension][link-cws] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/hlepfoohegkhhmjieoechaddaejaokhf.svg?label=%20">][link-cws]
- [**Firefox** add-on][link-amo] [<img valign="middle" src="https://img.shields.io/amo/v/refined-github-.svg?label=%20">][link-amo]
- **Opera** extension: Use [this Opera extension](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/) to install the Chrome version.


## Highlights

<table>
	<tr>
		<th width="50%">
			Mark issues and pull requests as unread<br>
			<em>(They will reappear in Notifications)</em>
		</th>
		<th width="50%">
			Avoids the jump caused by recently pushed branches by moving them to the side
		</th>
	</tr>
	<tr><!-- Prevent zebra stripes --></tr>
	<tr>
		<td>
			<img width="245" src="https://user-images.githubusercontent.com/1402241/27847663-963b7d7c-6171-11e7-9470-6e86d8463771.png">
		</td>
		<td>
			<img width="400" src="https://user-images.githubusercontent.com/1402241/34099674-20433f60-e41b-11e7-8ca5-7ea23c70ab95.gif">
		</td>
	</tr>
</table>

<table>
	<tr>
		<th width="50%">
			Reaction avatars
		</th>
		<th width="50%">
			Waits for the PR checks before merging a PR
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
			Linkifies issue/PR references in code, comments and titles
		</th>
		<th width="50%">
			Shows links to closing PR in issues and PR
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


### Added features

- Toggle all [outdated PR comments](https://user-images.githubusercontent.com/25818354/33240033-3e271588-d2af-11e7-93af-13b6e325f65d.gif) or [PR/Commit files](https://user-images.githubusercontent.com/1402241/35192652-6f79dc42-fec9-11e7-89ad-2b4a9c5f4f52.gif) with <kbd>Alt</kbd>+click
- Copy canonical link to file when [the <kbd>y</kbd> hotkey](https://help.github.com/articles/getting-permanent-links-to-files/) is used
- Supports indenting with the tab key in textareas like the comment box (<kbd>Shift</kbd> <kbd>Tab</kbd> for original behavior)
- [Uses the pull request title as commit title when merging with 'Squash and merge'](https://github.com/sindresorhus/refined-github/issues/276)
- [Automatically embeds linked gists in comments](https://user-images.githubusercontent.com/6978877/33911900-c62ee968-df8b-11e7-8685-506ffafc60b4.PNG)
- [Adds scoped search on each users profile page](https://user-images.githubusercontent.com/1402241/35185441-24ad4b1e-fe37-11e7-9e1b-0dc09fc1ada2.png)

### More actions

- [Linkifies branch references in pull requests](https://github.com/sindresorhus/refined-github/issues/1)
- [Adds a quick edit button to the readme](https://user-images.githubusercontent.com/170270/27501200-31a1fa20-586c-11e7-9a3f-ce270014bf0a.png)
- [Adds a shortcut to quickly delete a forked repo](https://cloud.githubusercontent.com/assets/170270/13520281/b2c9335c-e211-11e5-9e36-b0f325166356.png)
- [Adds a button to open all notifications at once](https://user-images.githubusercontent.com/1402241/31700005-1b3be428-b38c-11e7-90a6-8f572968993b.png)
- [Adds option to view diffs without whitespace changes](https://cloud.githubusercontent.com/assets/170270/17603894/7b71a166-6013-11e6-81b8-22950ab8bce3.png) *(<kbd>d</kbd> <kbd>w</kbd> hotkey)*
- [Adds `Copy` button to the file view](https://cloud.githubusercontent.com/assets/170270/14453865/8abeaefe-00c1-11e6-8718-9406cee1dc0d.png)
- [Adds `Copy` button to gist files](https://cloud.githubusercontent.com/assets/170270/21074840/5dc37578-bf03-11e6-9fd9-501d73edef87.png)
- [Adds `Copy` button for file paths to pull request diffs](https://cloud.githubusercontent.com/assets/4201088/26023064/18c9c77c-37d2-11e7-8926-b0a05a2706ae.png)
- [Adds links to patch and diff for each commit](https://cloud.githubusercontent.com/assets/737065/13605562/22faa79e-e516-11e5-80db-2da6aa7965ac.png)
- [Adds links to view the repo at the time of each comment](https://user-images.githubusercontent.com/1402241/32310022-7fef6174-bf5d-11e7-960f-5041a8f073ac.png)
- [Adds a link in a user's profile to their public gists](https://user-images.githubusercontent.com/11544418/34268306-1c974fd2-e678-11e7-9e82-861dfe7add22.png)
- [Adds a 'Jump to bottom' link to discussion pages](https://user-images.githubusercontent.com/4331946/34298950-93876584-e720-11e7-898a-96f85e31aefe.png)
- [Adds a 'Your repositories' link to user profile dropdown](https://user-images.githubusercontent.com/4201088/34920280-479e2454-f996-11e7-8e24-ad69793b9d9b.png)
- [Adds a 'Download folder' button to repos](https://user-images.githubusercontent.com/1402241/35044451-fd3e2326-fbc2-11e7-82e1-61ec7bee612b.png)
- [Adds a `Toggle files` button to repos](https://user-images.githubusercontent.com/1402241/35480123-68b9af1a-043a-11e8-8934-3ead3cff8328.gif)
- [Adds links to the default branch and to the latest semver release](https://user-images.githubusercontent.com/1402241/36961980-389bd2b0-2080-11e8-8bff-bb8af52e7128.png)

### More info at a glance

- [Makes file headers sticky underneath the pull request header](https://user-images.githubusercontent.com/81981/28682784-78bac340-72fe-11e7-9386-bdbab7703693.gif)
- [Shows user's full name in comments](https://cloud.githubusercontent.com/assets/170270/16172068/0a67b98c-3580-11e6-92f0-6fc930ee17d1.png)
- [Differentiates merge commits from regular commits](https://user-images.githubusercontent.com/1402241/36772362-8ddf8138-1c87-11e8-9f34-1f6b76e5499f.png)
- [Adds labels to comments by the original poster](https://cloud.githubusercontent.com/assets/4331946/25075520/d62fbbd0-2316-11e7-921f-ab736dc3522e.png)
- [Adds build status and link to CI by the repo's title](https://user-images.githubusercontent.com/1402241/32562120-d65166e4-c4e8-11e7-90fb-cbaf36e2709f.png)
- [Color-codes and counts reviews in PRs list](https://user-images.githubusercontent.com/1402241/33474535-a814ee78-d6ad-11e7-8f08-a8b72799e376.png)
- [Shows all keyboard shortcuts in the help modal](https://user-images.githubusercontent.com/29176678/36999174-9f07d33e-20bf-11e8-83e3-b3a9908a4b5f.png)  *(<kbd>?</kbd> hotkey)*

### Declutter

- [Only shows activity cards on the dashboard on hover](https://camo.githubusercontent.com/259c70ec39d0d7f462d64f2d63836d7d8552b20d/68747470733a2f2f7468756d62732e6766796361742e636f6d2f4368696c6c79456d70747944776172666d6f6e676f6f73652d73697a655f726573747269637465642e676966)
- Hides other users starring/forking your repos from the news feed
- Moves the dashboard organization switcher to the right column
- Removes annoying hover effect in the repo file browser
- Hides unnecessary buttons from the comment box toolbar (each has a keyboard shortcut)
- Removes obvious tooltips
- Removes the "Projects" repo tab when there are no projects (New projects can be created via the ["Create new…" menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png))

### UI improvements

- [Moves destructive buttons in commenting forms away from the primary button](https://user-images.githubusercontent.com/170270/27985285-a5464fb2-63e8-11e7-8c01-f33bb7ad78ba.png)
- [Improves readability of tab indented code](https://cloud.githubusercontent.com/assets/170270/14170088/d3be931e-f755-11e5-8edf-c5f864336382.png)
- [Aligns labels to the left in Issues and PRs lists](https://user-images.githubusercontent.com/1402241/28006237-070b8214-6581-11e7-94bc-2b01a007d00b.png)
- [Lets you approve or reject reviews faster](https://user-images.githubusercontent.com/1402241/34326942-529cb7c0-e8f3-11e7-9bee-98b667e18a90.png)
- Prompts you when pressing `Cancel` on an inline comment in case it was a mistake
- Easier copy-pasting from diffs by making +/- signs unselectable
- Automagically expands the news feed when you scroll down
- Shows the reactions popover on hover instead of click
- Changes the default sort order of milestones to "Closest due date"
- Changes the default sort order of issues/PRs to "Recently updated"
- [Makes the "Expand diff" button wider](https://user-images.githubusercontent.com/6978877/34470024-eee4f43e-ef20-11e7-9036-65094bd58960.PNG)
- [Automatically closes modals when they’re no longer visible](https://user-images.githubusercontent.com/1402241/37022353-531c676e-2155-11e8-96cc-80d934bb22e0.gif)
- [Highlights permalinked comments](https://user-images.githubusercontent.com/1402241/37349492-226bd37a-2709-11e8-8087-d9686b330240.png)
- [Hides inactive deployments in PR timeline](https://github.com/sindresorhus/refined-github/issues/1144)

And [lots](source/content.css) [more...](source/content.js)

### More shortcuts

- [Adds a 'Releases' tab to repos](https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png) *(<kbd>g</kbd> <kbd>r</kbd> hotkey)*
- [Adds a 'Compare' tab to repos](https://user-images.githubusercontent.com/170270/27501134-cf0a2a18-586b-11e7-8430-22f33030e923.png)
- [Adds navigation to milestone pages](https://cloud.githubusercontent.com/assets/170270/25217211/37b67aea-25d0-11e7-8482-bead2b04ee74.png)
- [Adds search filter for 'Everything commented by you'](https://user-images.githubusercontent.com/170270/27501170-f394a304-586b-11e7-92d8-d92d6922356b.png)
- [Adds `Yours` and `Commented` buttons to Issues/Pull Requests page](https://user-images.githubusercontent.com/8295888/36827126-8bfc79c4-1d37-11e8-8754-992968b082be.png)
- [Condenses long URLs into references like _user/repo/.file@`d71718d`_](https://user-images.githubusercontent.com/1402241/27252232-8fdf8ed0-538b-11e7-8f19-12d317c9cd32.png)
- Adds a `Trending` link to the global navbar. *(<kbd>g</kbd> <kbd>t</kbd> hotkey)*
- Adds a keyboard shortcut to leave a single comment in PR diffs instead of starting a review. *(<kbd>shift</kbd>+<kbd>enter</kbd>)*
- Adds a keyboard shortcut to visit your profile. *(<kbd>g</kbd> <kbd>m</kbd> hotkey)*
- [Adds <kbd>↑</kbd> shortcut for editing your last comment](https://github.com/sindresorhus/refined-github/pull/961)

### Previously part of Refined GitHub

- ~~[Adds blame links for parent commits in blame view](https://github.com/sindresorhus/refined-github/issues/2#issuecomment-189141373)~~ [Implemented by GitHub](https://github.com/blog/2304-navigate-file-history-faster-with-improved-blame-view)
- ~~[Adds ability to collapse/expand files in a pull request diff](https://cloud.githubusercontent.com/assets/170270/13954167/40caa604-f072-11e5-89ba-3145217c4e28.png)~~ [Implemented by GitHub](https://cloud.githubusercontent.com/assets/170270/25772137/6a6b678e-3296-11e7-97c7-02e31ef17743.png)
- ~~[Adds issue/PR title preview tooltip in comments](https://user-images.githubusercontent.com/170270/30729486-2816df06-9f8a-11e7-8069-8999302e9ddd.png)~~ [Implemented by GitHub](https://user-images.githubusercontent.com/1402241/31265633-779ad0fe-aa35-11e7-8c42-a3b375f8f32c.png)


## Customization

We're happy to receive suggestions and contributions, but be aware this is a highly opinionated project. There's a very high bar for adding options. Users will always disagree with something. That being said, we're open to discussing things.

While this project is highly opinionated, this doesn't necessarily limit you from manually disabling functionality that is not useful for your workflow. Options include:

- Disable individual features in the extension options. *(Experimental)*

- *(CSS Only)* Use an extension that allows injecting custom styles into sites, based on a URL pattern. Stylish ([Chrome](https://chrome.google.com/webstore/detail/stylish/fjnbnpbmkenffdnngjfgmeleoegfcffe?hl=en)/[Firefox](https://addons.mozilla.org/en-US/firefox/addon/stylish/)) is one such tool. [Example](https://github.com/sindresorhus/refined-github/issues/136#issuecomment-204072018)

- Clone the repository, make the adjustments you need, and [load the unpacked extension in Chrome](https://developer.chrome.com/extensions/getstarted#unpacked), rather than installing from the Chrome Store.


## Contribute

See the [contribution guide](contributing.md) and join the [contributors](https://github.com/sindresorhus/refined-github/graphs/contributors)!

## Related

- [Awesome browser extensions for GitHub](https://github.com/stefanbuck/awesome-browser-extensions-for-github) - Awesome list
- [Octo Linker](https://github.com/octo-linker/chrome-extension/) - Navigate across files and packages
- [Notifier for GitHub](https://github.com/sindresorhus/notifier-for-github-chrome) - Shows your notification unread count
- [Do Not Merge WIP for GitHub](https://github.com/sanemat/do-not-merge-wip-for-github) - Prevents merging of incomplete PRs
- [Contributors on GitHub](https://github.com/hzoo/contributors-on-github) - Shows stats about contributors
- [Hide Files on GitHub](https://github.com/sindresorhus/hide-files-on-github) - Hides dotfiles from the file browser
- [Twitter for GitHub](https://github.com/bevacqua/twitter-for-github) - Shows a user's Twitter handle on their profile page
- [OctoEdit](https://github.com/DrewML/OctoEdit) - Markdown syntax highlighting in comments
- [GitHub Custom Tab Size](https://github.com/lukechilds/github-custom-tab-size) - Set custom tab size for code views *(Refined GitHub hard-codes it to 4)*
- [Show All GitHub Issues](https://github.com/sindresorhus/show-all-github-issues) - Shows both Issues and Pull Requests in the Issues tab
- [Notifications Preview for GitHub](https://github.com/tanmayrajani/notifications-preview-github) - See your notifications on hover on all pages
- [Refined Twitter](https://github.com/sindresorhus/refined-twitter) - Improves Twitter
- [GitHub Issue Link Status](https://github.com/bfred-it/github-issue-link-status) - Colorize issue and PR links to see their status (open, closed, merged)

Want more? Here are some ideas you could develop!

- [Format JS code blocks with Prettier](https://github.com/sindresorhus/module-requests/issues/99)
- [Customize the font of code blocks](https://github.com/sindresorhus/module-requests/issues/97)


## License

MIT
