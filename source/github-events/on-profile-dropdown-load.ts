import oneMutation from 'one-mutation';
import elementReady from 'element-ready';

export default async function onProfileDropdownLoad(): Promise<Element> {
	const dropdown = await elementReady('.Header-item:last-child .dropdown-menu');
	if (!exists()) {
		await oneMutation(dropdown!, {childList: true, filter: exists});		
	}
	return dropdown!;
}
