import {mount} from 'svelte';

import RelatedIssuesCount from './rgh-related-issues-count.svelte';

export default function mountRelatedIssuesCount(
	featureId: FeatureId,
	afterElement: Element,
	{linkify = false, single, plural, zero}: {linkify?: boolean; single: string; plural?: string; zero?: string},
): void {
	const container = document.createElement('sup');
	container.setAttribute('data-rgh-feature-related-count', '');
	afterElement.after(container);
	mount(RelatedIssuesCount, {
		target: container,
		props: {
			featureId, linkify, single, plural, zero,
		},
	});
}
