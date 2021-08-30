const {readdirSync} = require('fs');

const {getFeatures, getFeaturesMeta} = require('./readme-parser.ts'); // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const importedFeatures = getFeatures();
const featuresInReadme = getFeaturesMeta();

const errors = [];

for (const fileName of featuresDirContents) {
	if (fileName === 'index.tsx' || fileName.endsWith('.css')) {
		continue;
	}

	if (!fileName.endsWith('.tsx')) {
		errors.push(`ERR: The \`/source/features\` folder should only contain .css and .tsx files. File \`${fileName}\` violates that rule`);
		continue;
	}

	const featureId = fileName.replace('.tsx', '');
	if (!importedFeatures.includes(featureId)) {
		errors.push(`ERR: ${featureId} should be imported by \`/sources/refined-github.ts\``);
	}

	if (fileName.startsWith('rgh-')) {
		continue;
	}

	const featureMeta = featuresInReadme.find(feature => feature.id === featureId);
	if (!featureMeta) {
		errors.push(`ERR: The feature ${featureId} should be described in the readme`);
		continue;
	}

	if (featureMeta.description.length < 20) {
		errors.push(`ERR: ${featureId} should be described better in the readme (at least 20 characters)`);
	}
}

console.error(errors.join('\n'));

process.exitCode(errors.length);
