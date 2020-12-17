export default async function cssOnlyFeature(featureName: string): Promise<void> {
	await Promise.resolve(); // The event fires a bit before the document body loaded
	document.body.classList.add('rgh-' + featureName);
}
