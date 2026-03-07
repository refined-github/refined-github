import {readFileSync} from 'node:fs';
import {test, assert} from 'vitest';

// Re-run tests when these files change https://vitest.dev/guide/features.html#glob-import-meta-glob
void import.meta.glob([
	'../source/manifest.json',
]);

test('manifest host permissions include the hotfix host', () => {
	const manifest = JSON.parse(readFileSync('source/manifest.json', 'utf8')) as {
		host_permissions: string[];
	};

	assert.include(
		manifest.host_permissions,
		'https://refined-github.github.io/*',
	);
});
