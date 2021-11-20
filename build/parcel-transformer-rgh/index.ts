import {Transformer} from '@parcel/plugin';
import {getFeatures, getFeaturesMeta} from "../readme-parser.js";

export default new Transformer({
	async transform({asset}) {
		const code = `
			export const featureList = ${JSON.stringify(getFeatures())};
			export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
		`;
		asset.setCode(code);
		asset.type = 'js';
		return [asset];
	}
});
