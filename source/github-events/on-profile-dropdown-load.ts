import select from 'select-dom';
import oneMutation from 'one-mutation';
import elementReady from 'element-ready';

export default async function onProfileDropdownLoad(): Promise<Element> {
	const dropdown = await elementReady('.Header-item:last-child .dropdown-menu');
	if (!dropdownContentExists()) {
		await oneMutation(dropdown!, {childList: true, filter: dropdownContentExists});
	}

	return dropdown!;
}

function dropdownContentExists(): boolean {
	return select.exists('.Header-item:last-child .dropdown-menu .dropdown-item');
}
