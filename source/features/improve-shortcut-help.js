import {h} from 'dom-chef';
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';
import {getRepoPath} from '../libs/page-detect';

/**
 * A map of the shortcut group titles and their respective group IDs.
 * The IDs can be used to register new shortcuts using `registerShortcut`.
 */
const groups = {
	'Site wide shortcuts': 'site',
	Repositories: 'repos',
	'Source code browsing': 'source',
	'Pull request list': 'pr',
	'Pull request - Files changed tab': 'prFiles',
	Issues: 'issues',
	'Browsing commits': 'commits',
	'Commit list': 'commitList',
	Dashboards: 'dashboards',
	Notifications: 'notifications',
	'Network Graph': 'networkGraph',
	'Moving a column': 'projectColumns',
	'Moving a card': 'projectCards'
};
const shortcuts = [];

/**
 * Registers a new shortcut to be displayed in the shortcut help modal.
 * @param {String} groupId The ID of the group as defined in the `groups` map.
 * @param {String} hotkey The hotkey with keys separated by spaces.
 * @param {String} description What the shortcut does.
 */
export function registerShortcut(groupId, hotkey, description) {
	if (shortcuts.some(shortcut => shortcut.hotkey === hotkey)) {
		return;
	}
	shortcuts.push({groupId, hotkey, description});
}

function improveShortcutHelp() {
	// Remove redundant "Show All" button
	select('.js-see-all-keyboard-shortcuts').remove();

	const modal = select('.shortcuts');
	const groupElements = select.all('tbody', modal);
	for (const groupElement of groupElements) {
		const groupTitle = select('tr th:nth-child(2)', groupElement).textContent;
		if (groupTitle in groups) {
			const groupId = groups[groupTitle];

			if (groupElement.style.display === 'none') {
				if (groupId.startsWith('project') && !getRepoPath().startsWith('projects')) {
					// The "Projects"-related groups are quite big and not interesting to most users
					groupElement.remove();
				} else {
					// Reduced opacity of previously hidden groups
					groupElement.setAttribute('style', '');
					groupElement.classList.remove('js-hidden-pane');
					groupElement.classList.add('rgh-inactive-shortcut-group');
				}
			} else {
				// Push relevant (not hidden) groups to the top
				groupElement.parentElement.prepend(groupElement);
			}

			const groupShortcuts = shortcuts.filter(shortcut => shortcut.groupId === groupId);
			if (groupShortcuts.length > 0) {
				for (const {hotkey, description} of groupShortcuts) {
					groupElement.append(
						<tr>
							<td class="keys">
								{/* V This is a monstrosity. Please help me get rid of it. V */}
								{hotkey.split(' ').join(', ,').split(',').map(key => key === ' ' ? ' ' : <kbd>{key}</kbd>)}
							</td>
							<td>
								{description}
								<div
									class="rgh-shortcut-circle tooltipped tooltipped-e"
									aria-label="Shortcut added by Refined GitHub"
								/>
							</td>
						</tr>
					);
				}
			}
		}
	}
}

export default () => {
	observeEl('#facebox', records => {
		if (Array.from(records).some(record => record.target.matches('.shortcuts') &&
			Array.from(record.removedNodes).some(element => element.matches('.facebox-loading')))) {
			improveShortcutHelp();
		}
	}, {
		childList: true,
		subtree: true
	});
};
