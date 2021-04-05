/// <reference types="../source/globals" />
import path from 'path';
import regexJoin from 'regex-join';
import {readFileSync} from 'fs';
import {parse as parseMarkdown} from 'markdown-wasm/dist/markdown.node.js';

import {throwError} from '../webpack.config';

function searchInList(readmeContent: string, id: FeatureID): FeatureMeta | void {
	const lineRegex = regexJoin(/^/, `- [](# "${id}")`, /(?: 🔥)? (.+)$/m);
	const lineMatch = lineRegex.exec(readmeContent);
	if (!lineMatch) {
		return;
	}

	const urls: string[] = [];
	const urlExtracter = (_match: string, title: string, url: string): string => {
		urls.push(url);
		return title;
	};

	const markdownDescription = lineMatch[1].replace(/\[(.+?)]\((.+?)\)/g, urlExtracter);
	return {
		id,
		description: parseMarkdown(markdownDescription),
		screenshot: urls.find(url => /\.(png|gif)$/i.test(url))
	};
}

function searchInHighlights(readmeContent: string, id: FeatureID): FeatureMeta | void {
	const imageRegex = regexJoin(`<p><a title="${id}"></a> `, /(.+?)\n\t+<p><img src="(.+?)">/);
	const imageMatch = imageRegex.exec(readmeContent);
	if (imageMatch) {
		return {
			id,
			description: parseMarkdown(imageMatch[1] + '.'),
			screenshot: imageMatch[2]
		};
	}
}

export function getFeaturesMeta(): FeatureMeta[] {
	const readmeContent = readFileSync(path.join(__dirname, '../readme.md'), 'utf-8');
	const features = [];
	for (const id of getFeatures()) {
		if (!id.startsWith('rgh-')) {
			const details = searchInList(readmeContent, id) ?? searchInHighlights(readmeContent, id);
			if (details) {
				features.push(details);
			} else {
				throwError(id, 'needs a description in readme.md. Please refer to the style guide there');
			}
		}
	}

	return features;
}

export function getFeatures(): FeatureID[] {
	const contents = readFileSync(path.join(__dirname, '../source/refined-github.ts'), 'utf-8');
	return [...contents.matchAll(/^import '\.\/features\/([^.]+)';/gm)]
		.map(match => match[1] as FeatureID)
		.sort();
}
