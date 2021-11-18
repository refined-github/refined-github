/// <reference types="../source/globals" />

import regexJoin from 'regex-join';
import {readFileSync} from 'node:fs';
import {parse as parseMarkdown} from 'markdown-wasm/dist/markdown.node.js';

// Group names must be unique because they will be merged
const simpleFeatureRegex = /^- \[\]\(# "(?<simpleId>[^"]+)"\)(?: 🔥)? (?<simpleDescription>.+)$/gm;
const highlightedFeatureRegex = /<p><a title="(?<highlightedId>[^"]+)"><\/a> (?<highlightedDescripion>.+?)\n\t+<p><img src="(?<highlightedImage>.+?)">/g;
const featureRegex = regexJoin(simpleFeatureRegex, /|/, highlightedFeatureRegex);

function extractDataFromMatch(match: RegExpMatchArray): FeatureMeta {
	const {simpleId
,		simpleDescription
,		highlightedId
,		highlightedDescripion, highlightedImage} = match.groups!;
	if (highlightedId) {
		return {
			id: highlightedId as FeatureID,
			description: parseMarkdown(highlightedDescripion + '.'),
			screenshot: highlightedImage,
		};
	}

	const urls: string[] = [];
	const urlExtracter = (_match: string, title: string, url: string): string => {
		urls.push(url);
		return title;
	};

	const linkLessMarkdownDescription = simpleDescription.replace(/\[(.+?)]\((.+?)\)/g, urlExtracter);
	return {
		id: simpleId as FeatureID,
		description: parseMarkdown(linkLessMarkdownDescription),
		screenshot: urls.find(url => /\.(png|gif)$/i.test(url)),
	};
}

export function getFeaturesMeta(): FeatureMeta[] {
	const readmeContent = readFileSync('readme.md', 'utf-8');
	return [...readmeContent.matchAll(featureRegex)].map(match => extractDataFromMatch(match));
}

export function getFeatures(): FeatureID[] {
	const contents = readFileSync('source/refined-github.ts', 'utf-8');
	return [...contents.matchAll(/^import '\.\/features\/([^.]+)';/gm)]
		.map(match => match[1] as FeatureID)
		.sort();
}
