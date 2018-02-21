import {h} from 'dom-chef';
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

function addShortcuts() {
	const modal = select('.shortcuts');
	const groups = select.all('.keyboard-mappings tbody', modal);
	groups[1].append(
		<tr>
			<td class="keys">
				<kbd>g</kbd> <kbd>r</kbd>
			</td>
			<td>Go to Releases</td>
		</tr>
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
