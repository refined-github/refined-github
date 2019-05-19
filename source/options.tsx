import React from 'dom-chef';
import fitTextarea from 'fit-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from 'indent-textarea';

fitTextarea.watch('textarea');
indentTextarea.watch('textarea');

declare global {
	interface Window {
		collectFeatures: Map<string, string>;
	}
}

function buildFeatureCheckbox([name, description]: [string, string]) {
	return (
		<p>
			<input type="checkbox" name={`feature:${name}`} id={`feature:${name}`} />
			<span className="info">
				<label for={`feature:${name}`}>{name}</label>
				{' '}
				<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`} target="_blank">
						source
				</a> <br />
				<span className="description">{description}</span>
			</span>
		</p>
	);
}

const sortedFeaturePairs = [...window.collectFeatures.entries()]
	.sort(([a], [b]) => a.localeCompare(b));

console.log(sortedFeaturePairs);

document
	.querySelector('.js-features')!
	.append(...sortedFeaturePairs.map(buildFeatureCheckbox));

new OptionsSync().syncForm('#options-form');
