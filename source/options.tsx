import React from 'dom-chef';
import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import fitTextarea from 'fit-textarea';
import OptionsSync from 'webext-options-sync';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import indentTextarea from 'indent-textarea';
import parseBackticks from './libs/parse-backticks';
import {FeatureDetails} from './libs/features';
import {editTextNodes} from './features/linkify-urls-in-code';

fitTextarea.watch('textarea');
indentTextarea.watch('textarea');

declare global {
	interface Window {
		collectFeatures: Map<string, FeatureDetails>;
	}
}

function parseDescription(description: string): DocumentFragment {
	const descriptionFragment = parseBackticks(description);
	editTextNodes(linkifyUrls, descriptionFragment);

	for (const a of select.all('a', descriptionFragment)) {
		shortenLink(a, location.href);
	}

	return descriptionFragment;
}

function buildFeatureCheckbox([name, {description, screenshots = []}]: [string, FeatureDetails]): HTMLElement {
	if (typeof screenshots === 'string') {
		screenshots = [screenshots];
	}

	const parsedDescription = parseDescription(
		description.replace(/[^.]$/, '$&.') // Add period if missing
	);

	return (
		<p>
			<input type="checkbox" name={`feature:${name}`} id={`feature:${name}`} />
			<label for={`feature:${name}`} className="info">
				<span className="feature-name">{name}</span>
				{' '}
				<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
					source
				</a>
				{...screenshots.map(url => <>, <a href={url}>screenshot</a></>)}
				<br/>
				<span className="description">{parsedDescription}</span>
			</label>
		</p>
	);
}

const sortedFeaturePairs = [...window.collectFeatures.entries()]
	.sort(([a], [b]) => a.localeCompare(b));

document
	.querySelector('.js-features')!
	.append(...sortedFeaturePairs.map(buildFeatureCheckbox));

new OptionsSync().syncForm('#options-form');
