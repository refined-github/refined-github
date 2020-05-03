import 'webext-base-css/webext-base.css';
import './options.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
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

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{[...descriptionElement.childNodes]}</>;
}

function buildFeatureCheckbox({id, description, screenshot, disabled}: FeatureMeta): HTMLElement {
	// `undefined` disconnects it from the options
	const key = disabled ? undefined : `feature:${id}`;

	return (
		<div className={`feature feature--${disabled ? 'disabled' : 'enabled'}`} data-text={`${id} ${description}`.toLowerCase()}>
			<input type="checkbox" name={key} id={id} disabled={Boolean(disabled)}/>
			<div className="info">
				<label for={id}>
					<span className="feature-name">{id}</span>
					{' '}
					{disabled && <small>{parseDescription(`(Disabled because of ${disabled}) `)}</small>}
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${id}.tsx`}>
						source
					</a>
					{screenshot && <>, <a href={screenshot}>screenshot</a></>}
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

	// Highlight new features
	const {featuresAlreadySeen} = await browser.storage.local.get({featuresAlreadySeen: {}});
	const isFirstVisit = Object.keys(featuresAlreadySeen).length === 0;
	const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);

	for (const feature of select.all('.feature [type=checkbox]')) {
		if (!(feature.id in featuresAlreadySeen)) {
			featuresAlreadySeen[feature.id] = isFirstVisit ? tenDaysAgo : Date.now();
		}

		if (featuresAlreadySeen[feature.id] > tenDaysAgo) {
			feature.parentElement!.classList.add('feature-new');
		}
	}

	browser.storage.local.set({featuresAlreadySeen});

	// Improve textareas editing
	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// Enable feature filter
	select('#filter-features')!.addEventListener('input', featuresFilterHandler);

	// Add support for GHE domain selector
	addDomainSelector();

	// Add cache clearer
	const button = select<HTMLButtonElement>('#clear-cache')!;
	button.addEventListener('click', async () => {
		await cache.clear();
		const initialText = button.textContent;
		button.textContent = 'Cache cleared!';
		button.disabled = true;
		setTimeout(() => {
			button.textContent = initialText;
			button.disabled = false;
		}, 2000);
	});

	// Move debugging tools higher when side-loaded
	if (process.env.NODE_ENV === 'development') {
		select('#debugging-position')!.replaceWith(select('#debugging')!);
	}
}

init();
