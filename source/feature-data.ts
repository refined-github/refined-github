// Run `npm run vitest` to update these files
import featuresMetasRaw from '../build/__snapshots__/features-meta.json' with {type: 'json'};
import importedFeaturesRaw from '../build/__snapshots__/imported-features.json' with {type: 'json'};
import renamedFeatures from './feature-renames.json' with {type: 'json'};

export const importedFeatures = importedFeaturesRaw as FeatureId[];
export const featuresMeta = featuresMetasRaw as FeatureMeta[];

export function getNewFeatureName(possibleFeatureName: string): FeatureId | undefined {
	// @ts-expect-error Useless "no index type" error as usual
	const newFeatureName = renamedFeatures[possibleFeatureName] as FeatureId ?? possibleFeatureName;
	return importedFeatures.includes(newFeatureName) ? newFeatureName : undefined;
}

export function getOldFeatureNames(featureName: string): string[] {
	const oldNames: string[] = [];
	for (const [oldName, newName] of Object.entries(renamedFeatures)) {
		if (newName === featureName) {
			oldNames.push(oldName);
		}
	}

	return oldNames;
}
