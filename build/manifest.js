/* eslint-disable camelcase */
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [extensionPath, manifestVersion] = process.argv.slice(2);

if (!extensionPath || !manifestVersion) {
	throw new Error('Please provide a path to the extension and a manifest version, like: npm run manifest distribution 2');
}

const manifestPath = join(extensionPath, 'manifest.json');

if (!existsSync(manifestPath)) {
	throw new Error(`No manifest found in: ${extensionPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

if (manifestVersion === '2') {
	manifest.manifest_version = 2;
	manifest.web_accessible_resources = ['assets/resolve-conflicts.js'];
	delete manifest.background.service_worker;

	manifest.permissions = [
		...(manifest.permissions || []),
		...(manifest.host_permissions || []),
	];
	delete manifest.host_permissions;
	delete manifest.optional_host_permissions;

	manifest.browser_action = manifest.action;
	delete manifest.action;
} else {
	delete manifest.background.scripts;
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
