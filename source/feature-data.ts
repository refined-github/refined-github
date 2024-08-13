import importedFeaturesRaw from '../build/__snapshots__/imported-features.json';
import featuresMetasRaw from '../build/__snapshots__/features-meta.json';

export {default as renamedFeatures} from './feature-renames.json';

export const importedFeatures = importedFeaturesRaw as FeatureID[];
export const featuresMeta = featuresMetasRaw as FeatureMeta[];

export function getNewFeatureName(possibleFeatureName: string): FeatureID | undefined {
	// @ts-expect-error Useless "no index type" error as usual
	const newFeatureName = renamedFeatures[possibleFeatureName] as FeatureID ?? possibleFeatureName;
	return importedFeatures.includes(newFeatureName) ? newFeatureName : undefined;
}
