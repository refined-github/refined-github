/// <reference types="../source/globals" />

import regexJoin from 'regex-join';
import {readFileSync} from 'node:fs';
import {parse as parseMarkdown} from 'markdown-wasm/dist/markdown.node.js';

export function findFeatureRegex(id: FeatureID): RegExp {
	return regexJoin(/^/, `- [](# "${id}")`, /(?: 🔥)? (?<plainFeatureDescription>.+)$|/gm, `<p><a title="${id}"></a> `, /(?<description>.+?)\n\t+<p><img src="(?<image>.+?)">/gm);
}

function searchFeature(readmeContent: string, id: FeatureID): FeatureMeta | void {
	const match = findFeatureRegex(id).exec(readmeContent);
	if (!match) {
		return;
	}

	const {plainFeatureDescription, description, image} = match.groups!;
	if (description) {
		return {
			id,
			description: parseMarkdown(description + '.'),
			screenshot: image,
		};
	}

	const urls: string[] = [];
	const urlExtracter = (_match: string, title: string, url: string): string => {
		urls.push(url);
		return title;
	};

	const linkLessMarkdownDescription = plainFeatureDescription.replace(/\[(.+?)]\((.+?)\)/g, urlExtracter);
	return {
		id,
		description: parseMarkdown(linkLessMarkdownDescription),
		screenshot: urls.find(url => /\.(png|gif)$/i.test(url)),
	};
}

export function getFeaturesMeta(): FeatureMeta[] {
	const readmeContent = readFileSync('readme.md', 'utf-8');
	const features = [];
	for (const id of getFeatures()) {
		if (!id.startsWith('rgh-')) {
			const details = searchFeature(readmeContent, id);
			if (details) {
				features.push(details);
			}
		}
	}

	return features;
}

export function getFeatures(): FeatureID[] {
	const contents = readFileSync('source/refined-github.ts', 'utf-8');
	return [...contents.matchAll(/^import '\.\/features\/([^.]+)';/gm)]
		.map(match => match[1] as FeatureID)
		.sort();
}
