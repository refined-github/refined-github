export default function readmePlugin(): {name: string; load(id: any): Promise<string | void>} {
	return {
		name: 'readme-plugin',
		async load(id: string): Promise<string | void> {
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
