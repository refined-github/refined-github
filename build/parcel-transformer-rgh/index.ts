// TODO: https://github.com/parcel-bundler/parcel/issues/7639
import {Transformer} from '@parcel/plugin';

import {getImportedFeatures, getFeaturesMeta} from '../readme-parser';

export default new Transformer({
	async transform({asset}) {
		const code = `
			module.exports.featureList = ${JSON.stringify(getImportedFeatures())};
			module.exports.featuresMeta = ${JSON.stringify(getFeaturesMeta())};
		`;
		asset.setCode(code);
		asset.type = 'js';
		return [asset];
	},
});
