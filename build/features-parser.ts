import {existsSync, readdirSync, readFileSync} from 'node:fs';

const featureFileRegex = /^(?<id>[^.]+)\.(?:tsx?|css)$/;
export const headerRegex = /^\/\*\*(?<body>[\s\S]*?)\*\//;

function getFeatureIds(): FeatureId[] {
	const ids = new Set<string>();
	for (const file of readdirSync('source/features')) {
		const id = featureFileRegex.exec(file)?.groups!.id;
		if (id) {ids.add(id);}
	}

	return [...ids] as FeatureId[];
}

// Reads the `@description` and `@screenshot` tags of the file header
function parseHeader(source: string): Record<string, string> {
	const body = headerRegex.exec(source)?.groups!.body ?? '';
	const text = body.split('\n').map(line => line.replace(/^\s*\* ?/, '')).join('\n');
	const tags: Record<string, string> = {};
	for (const chunk of text.split(/^@/m).slice(1)) {
		// eslint-disable-next-line regexp/no-super-linear-backtracking -- Why is this still enabled?
		const {name, value} = /^(?<name>\w+)\s+(?<value>[\s\S]*)$/.exec(chunk.trim())?.groups ?? {};
		if (name && value) {tags[name] ??= value;}
	}

	return tags;
}

function extractDataFromFeature(id: FeatureId): FeatureMeta | undefined {
	const hasCss = existsSync(`source/features/${id}.css`);
	const hasTsx = existsSync(`source/features/${id}.tsx`);
	const file = ['tsx', 'ts', 'css'].map(extension => `source/features/${id}.${extension}`).find(path =>
		existsSync(path)
	)!;
	const {description, screenshot} = parseHeader(readFileSync(file, 'utf8'));
	if (!description) {return;}

	return {
		id,
		description,
		// `undefined` hides the key when CSS is missing
		css: hasCss || undefined,
		// `undefined` hides the key for features that have a .tsx file
		cssOnly: (hasCss && !hasTsx) || undefined,
		// `null` makes the keys visible in the JSON file
		screenshot: screenshot ?? null,
	};
}

export function getFeaturesMeta(): FeatureMeta[] {
	return getFeatureIds()
		.map(id => extractDataFromFeature(id))
		.filter(meta => meta !== undefined)
		.toSorted((firstFeature, secondFeature) => firstFeature.id.localeCompare(secondFeature.id));
}

export function getImportedFeatures(): FeatureId[] {
	const contents = readFileSync('source/refined-github.ts', 'utf8');
	return [...contents.matchAll(/^import '\.\/features\/(?<id>[^.]+)\.js';/gm)]
		.map(match => match.groups!.id as FeatureId)
		.toSorted((a, b) => a.localeCompare(b));
}
