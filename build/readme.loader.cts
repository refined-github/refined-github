// Can't use modules because this is a bizarropackscript world
module.exports = async function ReadmeLoader () {
	const { getFeatures, getFeaturesMeta } = await import("./readme-parser.js");
  return `
		export const features = ${JSON.stringify(getFeatures())}
		export const featuresMeta = [${JSON.stringify(getFeaturesMeta())}]
  `;
}
