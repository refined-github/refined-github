import {mount, unmount} from 'svelte';

export default function mountUntilAborted(
	...[component, options, signal]: [...Parameters<typeof mount>, AbortSignal]
): ReturnType<typeof mount> {
	const instance = mount(component, options);
	signal.addEventListener('abort', async () => unmount(instance), {once: true});
	return instance;
}
