import {h} from 'dom-chef';
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';
import {getRepoPath} from '../libs/page-detect';

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

export function registerShortcut(group, hotkey, description) {
	if (shortcuts.some(shortcut => shortcut.hotkey === hotkey)) {
		return;
	}
	shortcuts.push({group, hotkey, description});
}

function addShortcuts() {
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
					groupElement.setAttribute('style', '');
					groupElement.classList.remove('js-panel-hidden');
					groupElement.classList.add('rgh-inactive-shortcut-group');
				}
			}

			const groupShortcuts = shortcuts.filter(shortcut => shortcut.group === groupId);
			if (groupShortcuts.length > 0) {
				for (const {hotkey, description} of groupShortcuts) {
					groupElement.append(
						<tr>
							<td class="keys">
								{/* V This is a monstrosity. Please help me get rid of it. V */}
								{hotkey.split(' ').join(', ,').split(',').map(key => key === ' ' ? ' ' : <kbd>{key}</kbd>)}
							</td>
							<td>{description}</td>
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
			addShortcuts();
		}
	}, {
		childList: true,
		subtree: true
	});
};
