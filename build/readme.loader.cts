// Can't use modules because this is a bizarropackscript world
async function ReadmeLoader() {
	const {getImportedFeatures, getFeaturesMeta} = await import('./readme-parser.js');
	return `
		export const importedFeatures = ${JSON.stringify(getImportedFeatures())};
		export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
	`;
}

module.exports = ReadmeLoader;
