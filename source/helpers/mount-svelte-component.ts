import {mount, type Component} from 'svelte';

export default function mountSvelteComponent(component: Component, target: Element, props: Record<string, unknown>): void {
	mount(component, {target, props});
}
