import {mount} from 'svelte';

import RelatedIssuesCount from './rgh-related-issues-count.svelte';

export default function mountRelatedIssuesCount(
	featureId: FeatureId,
	afterElement: Element,
	{linkify = false, emptyLabel}: {linkify?: boolean; emptyLabel?: string} = {},
): void {
	const container = document.createElement('span');
	afterElement.after(container);
	mount(RelatedIssuesCount, {
		target: container,
		props: {featureId, linkify, emptyLabel},
	});
}
