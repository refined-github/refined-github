import React from 'dom-chef';
import textarea from 'storm-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from './libs/indent-textarea';

textarea('textarea', {
	events: ['input']
});

document.querySelector('[name="customCSS"]').addEventListener('keydown', (event: KeyboardEvent) => {
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(event.target as HTMLTextAreaElement);
		event.preventDefault();
	}
});


declare global {
	interface Window {
		collectFeatures: string[];
	}
}

function buildFeatureCheckbox(name: string) {
	return <label>
		<input type="checkbox" name="disabledFeatures[]" value={name} /> {name}
		{' '}
		<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`} target="_blank">
			<small>source</small>
		</a>
	</label>
}

document
	.querySelector('.js-features')
	.append(...window.collectFeatures.sort().map(buildFeatureCheckbox));

new OptionsSync().syncForm('#options-form');
