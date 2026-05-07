import './rgh-related-issues-count.svelte'; // eslint-disable-line import-x/no-unassigned-import

export default function createRelatedIssuesCountElement(
	featureId: FeatureId,
	{includeLink = false, emptyLabel}: {includeLink?: boolean; emptyLabel?: string} = {},
): HTMLElement {
	const element = document.createElement('rgh-related-issues-count');
	element.setAttribute('feature-id', featureId);
	if (includeLink) {
		element.setAttribute('include-link', '');
	}

	if (emptyLabel) {
		element.setAttribute('empty-label', emptyLabel);
	}

	return element;
}
