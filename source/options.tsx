import './options.css';
import React from 'dom-chef';
import select from 'select-dom';
import fitTextarea from 'fit-textarea';
import {applyToLink} from 'shorten-repo-url';
import * as indentTextarea from 'indent-textarea';
import optionsStorage from './options-storage';
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

	return (
		<div className={`feature feature--${disabled ? 'disabled' : 'enabled'}`} data-text={`${name} ${description}`.toLowerCase()}>
			<input type="checkbox" name={key} id={name} disabled={Boolean(disabled)} />
			<div className="info">
				<label for={name}>
					<span className="feature-name">{name}</span>
					{' '}
					{disabled && <small>{parseDescription(`(Disabled because of ${disabled}) `)}</small>}
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
						source
					</a>
					{screenshot && <>, <a href={screenshot}>screenshot</a></>}
					<br/>
					<p className="description">{parseDescription(description)}</p>
				</label>
			</div>
		</div>
	);
}

function featuresFilterHandler(event: Event): void {
	const keywords = (event.currentTarget as HTMLInputElement).value.toLowerCase()
		.replace(/\W/g, ' ')
		.split(/\s+/)
		.filter(Boolean); // Ignore empty strings

	for (const feature of select.all('.feature')) {
		feature.hidden = !keywords.every(word => feature.dataset.text!.includes(word));
	}
}

function moveDisabledFeaturesToTop(): void {
	const container = select('.js-features')!;

	// .reverse() needed to preserve alphabetical order while prepending
	for (const unchecked of select.all('.feature--enabled [type=checkbox]:not(:checked)').reverse()) {
		container.prepend(unchecked.closest('.feature')!);
	}
}

async function domainPickerHandler({currentTarget: dropdown}: React.ChangeEvent<HTMLSelectElement>): Promise<void> {
	const optionsByOrigin = await optionsStorage.getAllOrigins();
	for (const [domain, options] of optionsByOrigin) {
		if (dropdown.value === domain) {
			options.syncForm(dropdown.form!);
		} else {
			options.stopSyncForm();
		}
	}

	select<HTMLAnchorElement>('#personal-token-link')!.host = dropdown.value;
}

async function addDomainSelector(): Promise<void> {
	const optionsByOrigin = await optionsStorage.getAllOrigins();
	if (optionsByOrigin.size === 1) {
		return;
	}

	select('form')!.before(
		<p>Domain selector:
			<select onChange={domainPickerHandler}>
				{[...optionsByOrigin.keys()].map(domain => <option value={domain}>{domain}</option>)}
			</select>
		</p>,
		<hr />
	);
}

function init(): void {
	// Generate list
	select('.js-features')!.append(...__featuresInfo__.map(buildFeatureCheckbox));

	// Update list from saved options
	optionsStorage.syncForm('form');
	moveDisabledFeaturesToTop();

	// Improve textareas editing
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// Enable feature filter
	select('#filter-features')!.addEventListener('input', featuresFilterHandler);

	// Add support for GHE domain selector
	addDomainSelector();
}

init();
