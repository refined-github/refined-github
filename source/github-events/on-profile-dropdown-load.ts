import oneMutation from 'one-mutation';
import elementReady from 'element-ready';

export default async function onProfileDropdownLoad(): Promise<Element> {
	const dropdown = await elementReady('.Header-item:last-child .dropdown-menu', {waitForChildren: false});
	await oneMutation(dropdown!, {childList: true});
	return dropdown!;
}
