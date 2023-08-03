/// <reference types="../source/globals.js" />

import regexJoin from 'regex-join';
import {readFileSync} from 'node:fs';
import parseMarkdown from 'snarkdown';

// Group names must be unique because they will be merged
const simpleFeatureRegex = /^- \[]\(# "(?<simpleId>[^"]+)"\)(?: 🔥)? (?<simpleDescription>.+)$/gm;
const highlightedFeatureRegex = /<p><a title="(?<highlightedId>[^"]+)"><\/a> (?<highlightedDescripion>.+?)\n\t+<p><img src="(?<highlightedImage>.+?)">/g;
// eslint-disable-next-line unicorn/better-regex -- ur wrong
const featureRegex = regexJoin(simpleFeatureRegex, /|/, highlightedFeatureRegex);
const screenshotRegex = /\.\w{3}$/; // 3 since .png and .gif have 3 letters

function extractDataFromMatch(match: RegExpMatchArray): FeatureMeta {
	const {
		simpleId,
		simpleDescription,
		highlightedId,
		highlightedDescripion,
		highlightedImage,
	} = match.groups!;
	if (highlightedId) {
		return {
			id: highlightedId as FeatureID,
			description: parseMarkdown(highlightedDescripion + '.'),
			screenshot: highlightedImage,
		};
	}

	const urls: string[] = [];
	function urlExtracter(_match: string, title: string, url: string): string {
		urls.push(url);
		return title;
	}

	const linkLessMarkdownDescription = simpleDescription.replaceAll(/\[(.+?)]\((.+?)\)/g, urlExtracter);
	return {
		id: simpleId as FeatureID,
		description: parseMarkdown(linkLessMarkdownDescription),
		screenshot: urls.find(url => screenshotRegex.test(url)),
	};
}

export function getFeaturesMeta(): FeatureMeta[] {
	const readmeContent = readFileSync('readme.md', 'utf8');
	return [...readmeContent.matchAll(featureRegex)]
		.map(match => extractDataFromMatch(match))
		.sort((firstFeature, secondFeature) => firstFeature.id.localeCompare(secondFeature.id));
}

export function getImportedFeatures(): FeatureID[] {
	const contents = readFileSync('source/refined-github.ts', 'utf8');
	return [...contents.matchAll(/^import '\.\/features\/([^.]+)\.js';/gm)]
		.map(match => match[1] as FeatureID)
		.sort();
}
