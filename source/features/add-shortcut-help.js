import {h} from 'dom-chef';
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

const shortcuts = [];

export function registerShortcut(hotkey, description) {
	if (shortcuts.some(shortcut => shortcut.hotkey === hotkey)) {
		return;
	}
	shortcuts.push({hotkey, description});
}

function addShortcuts() {
	const modal = select('.shortcuts');
	const thirdColumn = select.all('.column .keyboard-mappings', modal)[2];
	thirdColumn.append(
		<tbody>
			<tr>
				<th/>
				<th>Refined GitHub</th>
			</tr>
			{
				shortcuts.map(({hotkey, description}) => (
					<tr>
						<td class="keys">
							{/* This is a monstrosity. Plese help me get rid of it. */}
							{hotkey.split(' ').join(', ,').split(',').map(key => key === ' ' ? ' ' : <kbd>{key}</kbd>)}
						</td>
						<td>{description}</td>
					</tr>
				))
			}
		</tbody>
	);
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
