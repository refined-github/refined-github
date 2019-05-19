import React from 'dom-chef';
import fitTextarea from 'fit-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from 'indent-textarea';

fitTextarea.watch('textarea');
indentTextarea.watch('textarea');

declare global {
	interface Window {
		collectFeatures: string[];
	}
}

function buildFeatureCheckbox(name: string) {
	return (
		<p>
			<label>
				<input type="checkbox" name="disabledFeatures[]" value={name} /> <span>{name}</span>
			</label>
			{' '}
			<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`} target="_blank">
				source
			</a>
		</p>
	);
}

document
	.querySelector('.js-features')
	.append(...window.collectFeatures.sort().map(buildFeatureCheckbox));

new OptionsSync().syncForm('#options-form');
