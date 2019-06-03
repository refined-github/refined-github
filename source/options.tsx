import React from 'dom-chef';
import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import fitTextarea from 'fit-textarea';
import indentTextarea from 'indent-textarea';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import editTextNodes from './libs/linkify-text-nodes';
import parseBackticks from './libs/parse-backticks';
import optionsStorage from './options-storage';
import {FeatureDetails} from './libs/features';

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

function buildFeatureCheckbox([name, {description, screenshot, disabled}]: [string, FeatureDetails]): HTMLElement {
	// `undefined` disconnects it from the options
	const id = disabled ? undefined : `feature:${name}`;

	const parsedDescription = parseDescription(
		(disabled ? `Disabled because of ${disabled}; \n` : '') +
		description
	);

	return (
		<p>
			<input type="checkbox" name={id} id={id} disabled={Boolean(disabled)} />
			<label for={id} className="info">
				<span className="feature-name">{name}</span>
				{' '}
				<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
					source
				</a>
				{screenshot ? <>, <a href={screenshot}>screenshot</a></> : ''}
				<br/>
				<span className="description">{parsedDescription}</span>
			</label>
		</p>
	);
}

const featureCheckboxes = [...window.collectFeatures.entries()]
	.sort(([a], [b]) => a.localeCompare(b)) // Sort by feature name
	.map(buildFeatureCheckbox);

document
	.querySelector('.js-features')!
	.append(...featureCheckboxes);

optionsStorage.syncForm('#options-form');
