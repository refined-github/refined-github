import {onAbort} from 'abort-utils';
import {mount, unmount} from 'svelte';

export default function mountUntilAborted(
	...[component, options, signal]: [...Parameters<typeof mount>, AbortSignal]
): ReturnType<typeof mount> {
	const instance = mount(component, options);
	onAbort(signal, async () => unmount(instance));
	return instance;
}
