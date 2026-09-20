import {cp, mkdir, rm, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {rollup} from 'rollup';
import svelte from 'rollup-plugin-svelte';
import {render} from 'svelte/server';

import featureGroups from './feature-groups.json' with {type: 'json'};
// @ts-expect-error Node
// eslint-disable-next-line n/file-extension-in-import
import {getFeaturesMeta} from './features-parser.ts';

const featuresMeta = new Map<string, ReturnType<typeof getFeaturesMeta>[number]>(
	getFeaturesMeta().map(meta => [meta.id, meta]),
);

const groups = Object.entries<string[]>(featureGroups).map(([name, entries]) => ({
	name,
	features: entries.map(entry => {
		const id = entry.replace(/^🔥 /, '');
		const meta = featuresMeta.get(id);
		if (!meta) {
			throw new Error(`Unknown feature in feature-groups.json: ${id}`);
		}

		return {id, description: meta.description, screenshot: meta.screenshot, fire: id !== entry};
	}),
}));

// Compile the page to a server-side Svelte module
const ssrFile = 'website/.cache/page.js';
const bundle = await rollup({
	input: 'website/index.svelte',
	external: [/^svelte(?:\/|$)/],
	plugins: [svelte({emitCss: false, compilerOptions: {generate: 'server', css: 'injected'}})],
});
await bundle.write({file: ssrFile, format: 'esm'});
await bundle.close();

const {default: Page} = await import(pathToFileURL(ssrFile).href);
const {head, body} = render(Page, {props: {groups}});

const html = `<!DOCTYPE html>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1" name="viewport">
<meta content="light dark" name="color-scheme">
<meta content="Simplifies the GitHub interface and adds useful features" name="description">
<link href="icon.png" rel="icon">
<title>Refined GitHub</title>
<link href="webext-base.css" rel="stylesheet">
<link href="options.css" rel="stylesheet">
<link href="website.css" rel="stylesheet">
${head}
${body}
`;

await rm('website/dist', {recursive: true, force: true});
await mkdir('website/dist', {recursive: true});
await Promise.all([
	cp('node_modules/webext-base-css/webext-base.css', 'website/dist/webext-base.css'),
	cp('source/options.css', 'website/dist/options.css'),
	cp('source/icon.png', 'website/dist/icon.png'),
	cp('website/website.css', 'website/dist/website.css'),
	writeFile('website/dist/index.html', html),
]);
