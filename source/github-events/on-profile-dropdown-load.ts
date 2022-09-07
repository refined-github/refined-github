import select from 'select-dom';
import oneMutation from 'one-mutation';
import elementReady from 'element-ready';

export default async function onProfileDropdownLoad(): Promise<Element> {
	const dropdown = await elementReady('.Header-item:nth-last-child(2) .dropdown-menu');
	if (!dropdownContentExists()) {
		await oneMutation(dropdown!, {childList: true, filter: dropdownContentExists});
	}

	return dropdown!;
}

function dropdownContentExists(): boolean {
	return select.exists('.Header-item:nth-last-child(2) .dropdown-menu .dropdown-item');
}
