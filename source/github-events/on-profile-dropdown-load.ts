import oneMutation from 'one-mutation';

export default async function onProfileDropdownLoad(): Promise<Element> {
	const dropdown = document.querySelector('.Header-item:last-child .dropdown-menu')!;
	await oneMutation(dropdown, {childList: true});
	return dropdown;
}
