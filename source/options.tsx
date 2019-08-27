import './options.css';
import doma from 'doma';
import React from 'dom-chef';
import select from 'select-dom';
import doubledown from 'doubledown';
import fitTextarea from 'fit-textarea';
import indentTextarea from 'indent-textarea';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import {getAllOptions} from './options-storage';
import {linkifyIssuesInDom} from './features/linkify-code';

function parseDescription(description: string): Element {
	const descriptionElement = doma.one(`<span>${doubledown(description)}</span>`)!;
	linkifyIssuesInDom(descriptionElement);

	for (const a of select.all('a', descriptionElement)) {
		shortenLink(a, location.href);
	}

	return descriptionElement;
}

function buildFeatureCheckbox({name, description, screenshot, disabled}: FeatureInfo): HTMLElement {
	// `undefined` disconnects it from the options
	const key = disabled ? undefined : `feature:${name}`;

	const parsedDescription = parseDescription(
		(disabled ? `Disabled because of ${disabled}; \n` : '') +
		description
	);

	return (
		<div className="feature">
			<input type="checkbox" name={key} id={name} disabled={Boolean(disabled)} />
			<div className="info">
				<label for={name}>
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

async function init(): Promise<void> {
	select('.js-features')!.append(...__featuresInfo__.map(buildFeatureCheckbox));

	const form = select('form')!;
	const optionsByDomain = await getAllOptions();
	await optionsByDomain.get('github.com')!.syncForm(form);

	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// GitHub Enterprise domain picker
	if (optionsByDomain.size > 1) {
		const dropdown = (
			<select>
				{[...optionsByDomain.keys()].map(domain => <option value={domain}>{domain}</option>)}
			</select>
		) as any as HTMLSelectElement;
		form.before(<p>Domain selector: {dropdown}</p>, <hr/>);
		dropdown.addEventListener('change', () => {
			for (const [domain, options] of optionsByDomain) {
				if (dropdown.value === domain) {
					options.syncForm(form);
				} else {
					options.stopSyncForm();
				}
			}
		});
	}

	// Move minimized users input field below the respective feature checkbox
	select('[for="minimize-user-comments"]')!.after(select('.js-minimized-users-container')!);
}

init();
