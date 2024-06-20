export default function readmePlugin() {
	return {
		name: 'readme-plugin',
		async load(id) {
			if (id.endsWith('/readme.md')) {
				const {getImportedFeatures, getFeaturesMeta} = await import('./readme-parser.js');
				return `
					export const importedFeatures = ${JSON.stringify(getImportedFeatures())};
					export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
				`;
			}
		},
	};
}
