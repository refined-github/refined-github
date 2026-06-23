import {execSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {expect, test} from 'vitest';

import featureRenames from './feature-renames.json';

const oldNames = Object.keys(featureRenames);
const newNames = Object.values(featureRenames);

test.each(oldNames)('old feature name cannot appear anywhere: "%s"', async oldName => {
	const grep = `rg -l "[^-]${oldName}[^-]" -g !feature-renames.json -g !package-lock.json`;
	let results;
	try {
		// The async version is 50 times slower 🤷‍♂️
		results = execSync(grep, {encoding: 'utf8'});
	} catch {
		return;
	}

	throw new Error(`Old feature name "${oldName}" found in ${results}`);
});

test.concurrent.each(newNames)('new feature must exist: source/features/%s.tsx', async newName => {
	const filePath = path.join('source', 'features', `${newName}.tsx`);
	await expect(fs.stat(filePath)).resolves.toBeDefined();
});
