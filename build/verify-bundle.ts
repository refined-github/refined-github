import {readdirSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const distribution = 'distribution/assets';

// Update when adding or removing features
const expectedFeatureFiles = 233; // Includes svelte and gql
const featureFilesTolerance = 50;
const expectedCssFiles = 2;

const files = readdirSync(distribution, {recursive: true, withFileTypes: true})
	.filter(entry => entry.isFile())
	.map(entry => path.relative(distribution, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'));

const cssFiles = files.filter(file => file.endsWith('.css'));
const featureFiles = files.filter(file => file.startsWith('features/'));

const errors: string[] = [];

if (cssFiles.length !== expectedCssFiles) {
	errors.push(`Expected ${expectedCssFiles} CSS files, found ${cssFiles.length}: ${cssFiles.join(', ')}`);
}

if (Math.abs(featureFiles.length - expectedFeatureFiles) > featureFilesTolerance) {
	errors.push(
		`Expected ${expectedFeatureFiles} ± ${featureFilesTolerance} files in features/, found ${featureFiles.length}`,
	);
}

if (errors.length > 0) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
}
