import React from 'dom-chef';
import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import fitTextarea from 'fit-textarea';
import indentTextarea from 'indent-textarea';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import editTextNodes from './libs/linkify-text-nodes';
import parseBackticks from './libs/parse-backticks';
import optionsStorage from './options-storage';

function parseDescription(description: string): DocumentFragment {
	const descriptionFragment = parseBackticks(description);
	editTextNodes(linkifyUrls, descriptionFragment);

	for (const a of select.all('a', descriptionFragment)) {
		shortenLink(a, location.href);
	}

	return descriptionFragment;
}

function buildFeatureCheckbox({name, description, screenshot, disabled}: FeatureInfo): HTMLElement {
	// `undefined` disconnects it from the options
	const id = disabled ? undefined : `feature:${name}`;

	const parsedDescription = parseDescription(
		(disabled ? `Disabled because of ${disabled}; \n` : '') +
		description
	);

	return (
		<div className="feature">
			<input type="checkbox" name={id} id={id} disabled={Boolean(disabled)} />
			<div className="info">
				<label for={id}>
					<span className="feature-name">{name}</span>
					{' '}
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
						source
					</a>
					{screenshot ? <>, <a href={screenshot}>screenshot</a></> : ''}
					<br/>
					<p className="description">{parsedDescription}</p>
				</label>
			</div>
		</div>
	);
}

select('.js-features')!.append(...__featuresInfo__.map(buildFeatureCheckbox));

// Move minimized users input field below the respective feature checkbox
select('[for="feature:minimize-user-comments"]')!.after(select('.js-minimized-users-container')!);

optionsStorage.syncForm('#options-form');

// TODO: use `await` when this is solved: https://github.com/bfred-it/webext-options-sync/issues/24
requestAnimationFrame(() => {
	// `minimizedUsers` is hidden by a CSS selector until the options are updated, so its height will be 0px until then
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');
});
