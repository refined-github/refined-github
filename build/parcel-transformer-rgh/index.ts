import {Transformer} from '@parcel/plugin';

export default new Transformer({
	async transform({asset}) {
		const {getImportedFeatures, getFeaturesMeta} = await import('../readme-parser');

		const code = `
			export const featureList = ${JSON.stringify(getImportedFeatures())};
			export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
		`;
		asset.setCode(code);
		asset.type = 'js';
		return [asset];
	},
});
