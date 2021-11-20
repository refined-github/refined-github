const {Transformer} = require('@parcel/plugin');

exports.default = new Transformer({
	async transform({asset}) {
		const {getFeatures, getFeaturesMeta} = await import('../../build/readme-parser.ts');
		const code = `
			export const featureList = ${JSON.stringify(getFeatures())};
			export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
		`;
		asset.setCode(code);
		asset.type = 'js';
		return [asset];
	},
});
