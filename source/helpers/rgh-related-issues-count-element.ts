import {mount} from 'svelte';

import RelatedIssuesCount from './rgh-related-issues-count.svelte';

export default function mountRelatedIssuesCount(
	featureId: string,
	element: Element,
	{
		linkify = false,
		single,
		plural,
		zero,
		loading,
		inside = false,
	}: {linkify?: boolean; single: string; plural?: string; zero?: string; loading?: string; inside?: boolean},
): void {
	let container: Element;
	if (inside) {
		container = element;
	} else {
		container = document.createElement('sup');
		container.setAttribute('data-rgh-feature-related-count', '');
		element.after(container);
	}

	mount(RelatedIssuesCount, {
		target: container,
		props: {
			featureId, linkify, single, plural, zero, loading,
		},
	});
}
