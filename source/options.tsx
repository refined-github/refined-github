import React from 'dom-chef';
import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import fitTextarea from 'fit-textarea';
import indentTextarea from 'indent-textarea';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import parseBackticks from './libs/parse-backticks';
import optionsStorage from './options-storage';
import features, {FeatureDetails} from './libs/features';
import {editTextNodes} from './features/linkify-urls-in-code';

fitTextarea.watch('textarea');
indentTextarea.watch('textarea');

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

const featureCheckboxes = [...features.list.entries()]
	.sort(([a], [b]) => a.localeCompare(b)) // Sort bt feature name
	.map(buildFeatureCheckbox);

document
	.querySelector('.js-features')!
	.append(...featureCheckboxes);

optionsStorage.syncForm('#options-form');
