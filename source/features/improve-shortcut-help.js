import {h} from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import observeEl from '../libs/simplified-element-observer';

/**
 * A map of the shortcut group titles and their respective group IDs.
 * The IDs can be used to register new shortcuts using `registerShortcut`.
 */
const groups = {
	'Site-wide shortcuts': 'site',
	Repositories: 'repos',
	'Source code browsing': 'source',
	'Pull request list': 'pr',
	'Pull request - Files changed tab': 'prFiles',
	'Pull request - Conversation tab': 'prConversation',
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

const splitKeys = keys => keys.replace(/\S+/g, '<kbd>$&</kbd>');

const fixKeys = dialog => {
	for (const key of select.all('kbd', dialog)) {
		if (key.textContent.includes(' ')) {
			key.replaceWith(domify(splitKeys(key.textContent)));
		}
	}
};

const addShortcuts = dialog => {
	for (const group of select.all('.Box', dialog)) {
		const title = select('.Box-header > .Box-title', group);
		const groupId = groups[title.innerText];
		if (groupId) {
			const groupList = select('ul', group);
			for (const shortcut of shortcuts.values()) {
				if (shortcut.groupId === groupId) {
					groupList.append(
						<li class="Box-row d-flex flex-row">
							<div class="flex-auto">{shortcut.description}</div>
							<div
								class="rgh-shortcut-circle tooltipped tooltipped-nw"
								aria-label="Shortcut added by Refined GitHub"
							/>
							<div
								class="ml-2 no-wrap"
								dangerouslySetInnerHTML={{__html: splitKeys(shortcut.hotkey)}}
							/>
						</li>
					);
				}
			}
		}
	}
};

export default () => {
	// NOTE: It seems that the dialog get added after 'keydown'
	// Alternative: Observe the body for the details elemet to be added
	document.addEventListener('keypress', ({key}) => {
		if (key === '?') {
			const dialog = select('details > details-dialog.kb-shortcut-dialog');
			observeEl(
				dialog,
				records => {
					if (
						[...records].some(record =>
							[...record.removedNodes].some(element =>
								element.matches('.js-details-dialog-spinner')
							)
						)
					) {
						addShortcuts(dialog);
						fixKeys(dialog);
					}
				},
				{childList: true}
			);
		}
	});
};
