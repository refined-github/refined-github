export const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideAllNoise: 'Hide events, bots, collapsed comments',
} as const;

export type State = keyof typeof states;

export const inlineWidgetAnchorSelector = [
	'[class^="HeaderMetadata-module__metadataContent"]',
	'[class*="HeaderMetadata-module__smallMetadataRow"]',
] as const;

export function shouldAppendWidgetToAnchor(anchor: Element): boolean {
	return anchor.matches(inlineWidgetAnchorSelector.join(','));
}
