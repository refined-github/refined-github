import {h} from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import observeEl from '../libs/simplified-element-observer';
import {isProject} from '../libs/page-detect';

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
const shortcuts = new Map();

/**
 * Registers a new shortcut to be displayed in the shortcut help modal.
 * @param {String} groupId The ID of the group as defined in the `groups` map.
 * @param {String} hotkey The hotkey with keys separated by spaces.
 * @param {String} description What the shortcut does.
 */
export function registerShortcut(groupId, hotkey, description) {
	shortcuts.set(hotkey, {groupId, hotkey, description});
}

function splitKeys(keys) {
	return keys.replace(/\S+/g, '<kbd>$&</kbd>');
}

function improveShortcutHelp() {
	// Remove redundant "Show All" button
	select('.js-see-all-keyboard-shortcuts').remove();

	// Close the modal with Esc
	select('.js-facebox-close').dataset.hotkey = 'Escape';

	const modal = select('.shortcuts');
	const groupElements = select.all('tbody', modal);
	for (const groupElement of groupElements) {
		const groupTitle = select('tr th:nth-child(2)', groupElement).textContent;
		if (groupTitle in groups) {
			const groupId = groups[groupTitle];

			if (groupElement.style.display === 'none') {
				if (groupId.startsWith('project') && !isProject()) {
					// The "Projects"-related groups are quite big and not interesting to most users
					groupElement.remove();
				} else {
					// Reduce opacity of previously hidden groups
					groupElement.removeAttribute('style');
					groupElement.classList.remove('js-hidden-pane');
					groupElement.classList.add('rgh-inactive-shortcut-group');
				}
			} else {
				// Push relevant (not hidden) groups to the top
				groupElement.parentElement.prepend(groupElement);
			}

			for (const {hotkey, description, groupId: thisGroupId} of shortcuts.values()) {
				if (thisGroupId === groupId) {
					groupElement.append(
						<tr>
							<td class="keys" dangerouslySetInnerHTML={{__html: splitKeys(hotkey)}}/>
							<td>
								{description}
								<div
									class="rgh-shortcut-circle tooltipped tooltipped-nw"
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

function fixKeys() {
	for (const key of select.all('.keys kbd')) {
		if (key.textContent.includes(' ')) {
			key.replaceWith(domify(splitKeys(key.textContent)));
		}
	}
}

export default () => {
	observeEl('#facebox', records => {
		if ([...records].some(record => record.target.matches('.shortcuts') &&
			[...record.removedNodes].some(element => element.matches('.facebox-loading')))) {
			improveShortcutHelp();
			fixKeys();
		}
	}, {
		childList: true,
		subtree: true
	});
};
