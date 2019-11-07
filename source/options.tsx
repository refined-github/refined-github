import './options.css';
import React from 'dom-chef';
import select from 'select-dom';
import fitTextarea from 'fit-textarea';
import {applyToLink} from 'shorten-repo-url';
import indentTextarea from 'indent-textarea';
import {getAllOptions} from './options-storage';
import * as domFormatters from './libs/dom-formatters';

function parseDescription(description: string): DocumentFragment {
	const descriptionElement = <span>{description}</span>;
	domFormatters.linkifyIssues(descriptionElement, {
		baseUrl: 'https://github.com',
		user: 'sindresorhus',
		repository: 'refined-github'
	});
	domFormatters.linkifyURLs(descriptionElement);
	domFormatters.parseBackticks(descriptionElement);

	for (const a of select.all('a', descriptionElement)) {
		applyToLink(a);
	}

	return descriptionElement;
}

function buildFeatureCheckbox({name, description, screenshot, disabled}: FeatureInfo): HTMLElement {
	// `undefined` disconnects it from the options
	const key = disabled ? undefined : `feature:${name}`;

	const disabledText = disabled ?
		<small>{parseDescription(`(Disabled because of ${disabled}) `)}</small> :
		false;

	return (
		<div className={`feature feature--${disabled ? 'disabled' : 'enabled'}`}>
			<input type="checkbox" name={key} id={name} disabled={Boolean(disabled)} />
			<div className="info">
				<label for={name}>
					<span className="feature-name">{name}</span>
					{' '}
					{disabledText}
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
						source
					</a>
					{screenshot ? <>, <a href={screenshot}>screenshot</a></> : ''}
					<br/>
					<p className="description">{parseDescription(description)}</p>
				</label>
			</div>
		</div>
	);
}

async function init(): Promise<void> {
	// Generate list
	const container = select('.js-features')!;
	container.append(...__featuresInfo__.map(buildFeatureCheckbox));

	// Update list from saved options
	const form = select('form')!;
	const optionsByDomain = await getAllOptions();
	await optionsByDomain.get('github.com')!.syncForm(form);

	// Move disabled features first
	for (const unchecked of select.all('.feature--enabled [type=checkbox]:not(:checked)', container).reverse()) {
		// .reverse() needed to preserve alphabetical order while prepending
		container.prepend(unchecked.closest('.feature')!);
	}

	// Improve textareas editing
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// GitHub Enterprise domain picker
	if (optionsByDomain.size > 1) {
		const dropdown = (
			<select>
				{[...optionsByDomain.keys()].map(domain => <option value={domain}>{domain}</option>)}
			</select>
		) as unknown as HTMLSelectElement;
		form.before(<p>Domain selector: {dropdown}</p>, <hr/>);
		dropdown.addEventListener('change', event => {
			for (const [domain, options] of optionsByDomain) {
				if (dropdown.value === domain) {
					options.syncForm(form);
				} else {
					options.stopSyncForm();
				}
			}

			const newHost = (event.target as HTMLInputElement).value;
			select<HTMLAnchorElement>('#personal-token-link')!.host = newHost;
		});
	}

	// Move minimized users input field below the respective feature checkbox
	select('[for="minimize-user-comments"]')!.after(select('.js-minimized-users-container')!);
}

init();
