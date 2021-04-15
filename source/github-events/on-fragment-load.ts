import oneEvent from 'one-event';

export default async function onFragmentLoad(fragment: HTMLElement | undefined, clickZone: HTMLElement): Promise<void> {
	if (!fragment) {
		return;
	}

	clickZone.dispatchEvent(new Event('mouseover'));
	await oneEvent(fragment, 'load');
}
